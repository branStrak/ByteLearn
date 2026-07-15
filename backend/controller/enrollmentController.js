const Enrollment = require('../model/Enrollment');
const Course = require('../model/Course');
const QuizAttempt = require('../model/QuizAttempt');
const Submission = require('../model/Submission');
const Assignment = require('../model/Assignment');
const Quiz = require('../model/Quiz');

const enrollInCourse = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ success: false, message: "courseId is required" });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });

        if (existingEnrollment) {
            return res.status(400).json({ success: false, message: "You are already enrolled in this course" });
        }

        if (course.isPaid) {
            return res.status(403).json({ success: false, message: "Payment required for this course" });
        }

        const enrollment = await Enrollment.create({
            studentId,
            courseId,
            enrolledAt: Date.now(),
            progressPercentage: 0
        });

        // Increment enrolled students count on Course
        await Course.findByIdAndUpdate(courseId, { $inc: { enrolledStudents: 1 } });

        res.status(201).json({ success: true, message: "Enrolled successfully", data: enrollment });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "You are already enrolled in this course" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyCourses = async (req, res) => {
    try {
        const studentId = req.user._id;

        const enrollments = await Enrollment.find({ studentId })
            .select('progressPercentage status courseId')
            .populate({
                path: 'courseId',
                select: 'title thumbnail price isPaid level duration description educatorId',
                populate: {
                    path: 'educatorId',
                    select: 'name'
                }
            })
            .lean();

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getEducatorRoster = async (req, res) => {
    try {
        const educatorId = req.user._id;

        // Find courses owned by or co-instructed by this educator
        const educatorCourses = await Course.find({ 
            $or: [
                { educatorId },
                { 'coInstructors.userId': educatorId }
            ]
        }).select('_id');
        const courseIds = educatorCourses.map(c => c._id);

        if (courseIds.length === 0) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
            .populate('studentId', 'name email profilePicture lastLogin')
            .populate({
                path: 'courseId',
                select: 'title gradingConfiguration',
                populate: [
                    { path: 'modules', populate: { path: 'lessons' } }
                ]
            })
            .sort({ enrolledAt: -1 })
            .lean();

        // Calculate performance metrics for each enrollment
        const enhancedRoster = await Promise.all(enrollments.map(async (enrollment) => {
            const studentId = enrollment.studentId?._id;
            const courseId = enrollment.courseId?._id;
            const config = enrollment.courseId?.gradingConfiguration || { quizWeight: 50, assignmentWeight: 50 };

            //quiz average
            const quizAttempts = await QuizAttempt.find({ studentId, courseId, status: 'completed' });
            let quizAvg = 0;
            if (quizAttempts.length > 0) {
                const totalPct = quizAttempts.reduce((acc, attempt) => {
                    const pct = (attempt.score / (attempt.totalMarksPossible || 1)) * 100;
                    return acc + pct;
                }, 0);
                quizAvg = totalPct / quizAttempts.length;
            }

            //Assignment Average Percentage
            const submissions = await Submission.find({ studentId, courseId, status: 'graded' });
            let assignmentAvg = 0;
            if (submissions.length > 0) {
                // We need the assignment total marks
                const totalPct = await submissions.reduce(async (accPromise, sub) => {
                    const acc = await accPromise;
                    const assignment = await Assignment.findById(sub.assignmentId).select('totalMarks');
                    const pct = (sub.marksObtained / (assignment?.totalMarks || 100)) * 100;
                    return acc + pct;
                }, Promise.resolve(0));
                assignmentAvg = totalPct / submissions.length;
            }


            let liveGrade = null;
            if (quizAttempts.length > 0 && submissions.length > 0) {
                 liveGrade = (quizAvg * (config.quizWeight / 100)) + (assignmentAvg * (config.assignmentWeight / 100));
            } else if (quizAttempts.length > 0) {
                 liveGrade = quizAvg;
            } else if (submissions.length > 0) {
                 liveGrade = assignmentAvg;
            }

            return {
                ...enrollment,
                performance: {
                    quizAvg: quizAttempts.length > 0 ? Math.round(quizAvg) : null,
                    assignmentAvg: submissions.length > 0 ? Math.round(assignmentAvg) : null,
                    liveGrade: liveGrade !== null ? Math.round(liveGrade) : null,
                    lastActive: enrollment.studentId?.lastLogin || enrollment.updatedAt
                }
            };
        }));

        res.status(200).json({
            success: true,
            count: enhancedRoster.length,
            data: enhancedRoster
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getEnrollmentDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const educatorId = req.user._id;

        const enrollment = await Enrollment.findById(id)
            .populate('studentId', 'name email profilePicture lastLogin')
            .populate({
                path: 'courseId',
                select: 'title gradingConfiguration educatorId coInstructors',
                populate: [
                    { path: 'modules', populate: [{ path: 'lessons' }, { path: 'quizzes' }, { path: 'assignments' }] }
                ]
            })
            .lean();

        if (!enrollment) {
            return res.status(404).json({ success: false, message: "Enrollment not found" });
        }

        // Verify educator ownership or collaboration
        const isOwner = enrollment.courseId.educatorId.toString() === educatorId.toString();
        const isCo = enrollment.courseId.coInstructors?.some(c => c.userId.toString() === educatorId.toString());

        if (!isOwner && !isCo) {
            return res.status(403).json({ success: false, message: "Unauthorized access to this enrollment" });
        }

        const studentId = enrollment.studentId?._id;
        if (!studentId) {
            return res.status(404).json({ success: false, message: "Student account not found" });
        }
        const courseId = enrollment.courseId?._id;

        // Fetch Quiz Attempts
        const quizAttempts = await QuizAttempt.find({ studentId, courseId })
            .populate('quizId', 'title')
            .sort({ submittedAt: -1 })
            .lean();

        // Fetch Submissions
        const submissions = await Submission.find({ studentId, courseId })
            .populate('assignmentId', 'title totalMarks')
            .sort({ submittedAt: -1 })
            .lean();

        //history
        const timeline = [
            ...quizAttempts.map(q => ({
                id: q._id,
                type: 'quiz',
                title: q.quizId?.title || 'Quiz',
                status: q.status,
                score: q.score,
                total: q.totalMarksPossible,
                date: q.submittedAt || q.startedAt,
                meta: `${q.totalQuestions} Questions`
            })),
            ...submissions.map(s => ({
                id: s._id,
                type: 'assignment',
                title: s.assignmentId?.title || 'Assignment',
                status: s.status,
                score: s.marksObtained,
                total: s.assignmentId?.totalMarks,
                date: s.submittedAt,
                meta: s.status === 'graded' ? 'Graded' : 'Pending'
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calculate live grade for detail view
        const config = enrollment.courseId?.gradingConfiguration || { quizWeight: 50, assignmentWeight: 50 };
        const completedQuizzes = quizAttempts.filter(q => q.status === 'completed');
        const gradedSubs = submissions.filter(s => s.status === 'graded');

        let quizAvg = 0;
        if (completedQuizzes.length > 0) {
            const totalPct = completedQuizzes.reduce((acc, a) => acc + (a.score / (a.totalMarksPossible || 1)) * 100, 0);
            quizAvg = totalPct / completedQuizzes.length;
        }

        let assignmentAvg = 0;
        if (gradedSubs.length > 0) {
            const totalPct = gradedSubs.reduce((acc, s) => {
                const pct = (s.marksObtained / (s.assignmentId?.totalMarks || 100)) * 100;
                return acc + pct;
            }, 0);
            assignmentAvg = totalPct / gradedSubs.length;
        }

        let liveGrade = null;
        if (completedQuizzes.length > 0 && gradedSubs.length > 0) {
            liveGrade = (quizAvg * (config.quizWeight / 100)) + (assignmentAvg * (config.assignmentWeight / 100));
        } else if (completedQuizzes.length > 0) {
            liveGrade = quizAvg;
        } else if (gradedSubs.length > 0) {
            liveGrade = assignmentAvg;
        }

        const performance = {
            liveGrade: liveGrade !== null ? Math.round(liveGrade) : null,
            lastActive: enrollment.studentId?.lastLogin || enrollment.updatedAt,
        };

        res.status(200).json({
            success: true,
            data: {
                enrollment: { ...enrollment, performance },
                quizAttempts,
                submissions,
                timeline
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    enrollInCourse,
    getMyCourses,
    getEducatorRoster,
    getEnrollmentDetail
};

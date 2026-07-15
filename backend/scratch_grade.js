const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Enrollment = require('./model/Enrollment');
const Course = require('./model/Course');
const QuizAttempt = require('./model/QuizAttempt');
const Submission = require('./model/Submission');
const Assignment = require('./model/Assignment');
const User = require('./model/User');

const testLiveGrade = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB.");

        const educators = await User.find({ role: 'educator' });
        if (educators.length === 0) {
            console.log("No educators found.");
            process.exit(0);
        }

        for (const educator of educators) {
            const educatorId = educator._id;
            const educatorCourses = await Course.find({ educatorId }).select('_id');
            const courseIds = educatorCourses.map(c => c._id);

            if (courseIds.length === 0) continue;

            const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
                .populate('studentId', 'name')
                .populate('courseId', 'title gradingConfiguration')
                .lean();

            for (const enrollment of enrollments) {
                const studentId = enrollment.studentId?._id;
                const courseId = enrollment.courseId?._id;
                const config = enrollment.courseId?.gradingConfiguration || { quizWeight: 50, assignmentWeight: 50 };

                const quizAttempts = await QuizAttempt.find({ studentId, courseId, status: 'completed' });
                let quizAvg = 0;
                if (quizAttempts.length > 0) {
                    const totalPct = quizAttempts.reduce((acc, attempt) => {
                        const pct = (attempt.score / (attempt.totalMarksPossible || 1)) * 100;
                        return acc + pct;
                    }, 0);
                    quizAvg = totalPct / quizAttempts.length;
                }

                const submissions = await Submission.find({ studentId, courseId, status: 'graded' });
                let assignmentAvg = 0;
                if (submissions.length > 0) {
                    const totalPct = await submissions.reduce(async (accPromise, sub) => {
                        const acc = await accPromise;
                        const assignment = await Assignment.findById(sub.assignmentId).select('totalMarks');
                        const pct = (sub.marksObtained / (assignment?.totalMarks || 100)) * 100;
                        return acc + pct;
                    }, Promise.resolve(0));
                    assignmentAvg = totalPct / submissions.length;
                }

                const liveGrade = (quizAvg * (config.quizWeight / 100)) + (assignmentAvg * (config.assignmentWeight / 100));

                console.log(`Student: ${enrollment.studentId?.name}, Course: ${enrollment.courseId?.title}`);
                console.log(`Quizzes: ${quizAttempts.length} (Avg: ${quizAvg})`);
                console.log(`Submissions: ${submissions.length} (Avg: ${assignmentAvg})`);
                console.log(`Live Grade (Old Logic): ${liveGrade}`);
                
                let newLiveGrade = 0;
                if (quizAttempts.length > 0 && submissions.length > 0) {
                     newLiveGrade = (quizAvg * (config.quizWeight / 100)) + (assignmentAvg * (config.assignmentWeight / 100));
                } else if (quizAttempts.length > 0) {
                     newLiveGrade = quizAvg;
                } else if (submissions.length > 0) {
                     newLiveGrade = assignmentAvg;
                }
                console.log(`Live Grade (New Logic): ${newLiveGrade}`);
                console.log("------------------------");
            }
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

testLiveGrade();

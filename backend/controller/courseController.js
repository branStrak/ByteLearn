const Course = require('../model/Course');
const Module = require('../model/Module');
const Lesson = require('../model/Lesson');
const Enrollment = require('../model/Enrollment');
const Submission = require('../model/Submission');
const QuizAttempt = require('../model/QuizAttempt');
const Quiz = require('../model/Quiz');
const Question = require('../model/Question');
const Assignment = require('../model/Assignment');
const mongoose = require('mongoose');
const { evaluateCourseCompletion } = require('../services/evaluationService');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

const cleanupTempFile = (file) => {
    if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
};

const validateGradingConfig = (config) => {
    if (!config) return null;
    const quizWeight = Number(config.quizWeight || 0);
    const assignmentWeight = Number(config.assignmentWeight || 0);
    const minGradeToPass = Number(config.minGradeToPass || 0);
    const isCertificationEnabled = !!config.isCertificationEnabled;
    const gradingScale = config.gradingScale;

    if ((quizWeight + assignmentWeight) !== 100) {
        return "Quiz Weight and Assignment Weight must sum up to exactly 100%.";
    }


    if (gradingScale && gradingScale.length > 0) {
        for (let i = 0; i < gradingScale.length - 1; i++) {
            if (Number(gradingScale[i].minScore) <= Number(gradingScale[i + 1].minScore)) {
                return `Grading scale must be in descending order. "${gradingScale[i].label}" (${gradingScale[i].minScore}) cannot be less than or equal to "${gradingScale[i + 1].label}" (${gradingScale[i + 1].minScore}).`;
            }
        }


        if (isCertificationEnabled) {
            const coversThreshold = gradingScale.some(grade => Number(grade.minScore) <= minGradeToPass);
            if (!coversThreshold) {
                return `Certification is enabled, but no grade level in your scale covers the "Minimum Grade to Pass" (${minGradeToPass}%).`;
            }
        }
    } else if (isCertificationEnabled) {
        return "Certification is enabled, but no grading scale is defined.";
    }

    return null;
};

const createCourse = async (req, res) => {
    try {
        const { title, description, category, level, price, isPaid, language } = req.body;

        if (!title || !description) {
            cleanupTempFile(req.file);
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }

        let thumbnailUrl = "";
        if (req.file) {
            const uploadedImage = await uploadOnCloudinary(req.file.path);
            if (!uploadedImage) {
                return res.status(500).json({ success: false, message: 'Error uploading thumbnail to Cloudinary' });
            }
            thumbnailUrl = uploadedImage.secure_url;
        }

        const course = await Course.create({
            educatorId: req.user._id,
            title,
            description,
            thumbnail: thumbnailUrl,
            category,
            level,
            price,
            isPaid,
            language,
            status: 'draft'
        });

        res.status(201).json({ success: true, data: course });
    } catch (error) {
        cleanupTempFile(req.file);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getEducatorCourses = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch both owned courses and co-instructed courses
        const [ownedCourses, coInstructedCourses] = await Promise.all([
            Course.find({ educatorId: userId }).sort({ createdAt: -1 }),
            Course.find({ 'coInstructors.userId': userId })
                .populate('educatorId', 'name profilePicture')
                .sort({ createdAt: -1 })
        ]);

        const owned = ownedCourses.map(c => ({ ...c.toObject(), isOwner: true }));
        const coInstructed = coInstructedCourses.map(c => ({ ...c.toObject(), isOwner: false }));

        res.status(200).json({ success: true, data: [...owned, ...coInstructed] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getEducatorDashboardStats = async (req, res) => {
    try {
        const educatorId = req.user._id;
        const courses = await Course.find({ educatorId });

        const totalCourses = courses.length;
        const approvedCourses = courses.filter(c => c.status === 'approved').length;
        const pendingApprovals = courses.filter(c => c.status === 'pending').length;

        const courseIds = courses.map(c => c._id);
        const totalStudents = await Enrollment.countDocuments({ courseId: { $in: courseIds } });

        const recentCoursesRaw = await Course.find({ educatorId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const recentCourses = await Promise.all(recentCoursesRaw.map(async (course) => {
            const students = await Enrollment.countDocuments({ courseId: course._id });
            const modules = await Module.countDocuments({ courseId: course._id });
            return {
                id: course._id,
                title: course.title,
                status: course.status,
                students: students,
                modules: modules
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalCourses,
                    approvedCourses,
                    pendingApprovals,
                    totalStudents
                },
                recentCourses
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllCourses = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = { status: "approved" };

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }
        if (category) {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') }; 
        }

        const courses = await Course.find(query)
            .select("title thumbnail price isPaid level rating totalRatings description educatorId category coInstructors enrolledStudents")
            .populate("educatorId", "name")
            .populate("coInstructors.userId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('educatorId', 'name profilePicture')
            .populate('coInstructors.userId', 'name profilePicture')
            .populate({
                path: 'modules',
                options: { sort: { order: 1 } },
                populate: [
                    { path: 'lessons', options: { sort: { order: 1 } } },
                    { path: 'quizzes', options: { sort: { order: 1 } } },
                    { path: 'assignments', options: { sort: { order: 1 } } }
                ]
            })
            .lean();

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.status !== 'approved') {
            const userId = req.user ? req.user._id.toString() : null;
            const userRole = req.user ? req.user.role : null;
            const isOwner = course.educatorId._id.toString() === userId;
            const isCo = course.coInstructors?.some(c => c.userId._id.toString() === userId);
            const isAdmin = userRole === 'admin';

            if (!isOwner && !isCo && !isAdmin) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }
        }

        if (course.modules) {
            course.modules.forEach(module => {
                if (module.lessons) {
                    module.lessons.forEach(lesson => {
                        delete lesson.videoUrl;
                        delete lesson.notesUrl;
                        delete lesson.content;
                    });
                }
                if (module.quizzes) {
                    module.quizzes.forEach(quiz => {
                        delete quiz.questions;
                    });
                }
                if (module.assignments) {
                    module.assignments.forEach(assignment => {
                        delete assignment.questions;
                    });
                }
            });
        }

        // Use denormalized count if available, otherwise fallback to live count
        if (course.enrolledStudents === undefined) {
            const liveCount = await Enrollment.countDocuments({ courseId: course._id });
            course.enrolledStudents = liveCount;
        }

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        console.log(`[UpdateCourse] ID: ${req.params.id}`);
        console.log(`[UpdateCourse] Body:`, JSON.stringify(req.body, null, 2));

        const course = await Course.findById(req.params.id);

        if (!course) {
            cleanupTempFile(req.file);
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.educatorId.toString() !== req.user._id.toString()) {
            cleanupTempFile(req.file);
            return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
        }

        const allowedUpdates = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            tags: req.body.tags,
            level: req.body.level,
            price: req.body.price,
            isPaid: req.body.isPaid,
            language: req.body.language,
            gradingConfiguration: req.body.gradingConfiguration,
        };

        if (allowedUpdates.gradingConfiguration) {
            // Parse if it's coming as a string (if from multipart form)
            if (typeof allowedUpdates.gradingConfiguration === 'string') {
                try {
                    allowedUpdates.gradingConfiguration = JSON.parse(allowedUpdates.gradingConfiguration);
                } catch (e) {
                    cleanupTempFile(req.file);
                    return res.status(400).json({ success: false, message: 'Invalid gradingConfiguration format' });
                }
            }

            const error = validateGradingConfig(allowedUpdates.gradingConfiguration);
            if (error) {
                cleanupTempFile(req.file);
                return res.status(400).json({ success: false, message: error });
            }
        }

        Object.keys(allowedUpdates).forEach(
            (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );

        if (req.file) {
            const uploadedImage = await uploadOnCloudinary(req.file.path);
            if (!uploadedImage) {
                return res.status(500).json({ success: false, message: 'Error uploading new thumbnail to Cloudinary' });
            }
            allowedUpdates.thumbnail = uploadedImage.secure_url;
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            allowedUpdates,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: updatedCourse });
    } catch (error) {
        cleanupTempFile(req.file);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCourse = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId).session(session);

        if (!course) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.educatorId.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
        }

        // --- Cascading Deletion ---
        
        // 1. Find all modules first to get their IDs
        const modules = await Module.find({ courseId }).session(session);
        const moduleIds = modules.map(m => m._id);

        // 2. Find all quizzes in those modules to get quiz IDs (for question deletion)
        const quizzes = await Quiz.find({ moduleId: { $in: moduleIds } }).session(session);
        const quizIds = quizzes.map(q => q._id);

        // 3. Perform bulk deletions
        await Promise.all([
            Question.deleteMany({ quizId: { $in: quizIds } }).session(session),
            Quiz.deleteMany({ moduleId: { $in: moduleIds } }).session(session),
            Lesson.deleteMany({ moduleId: { $in: moduleIds } }).session(session),
            Assignment.deleteMany({ moduleId: { $in: moduleIds } }).session(session),
            Module.deleteMany({ courseId }).session(session),
            Enrollment.deleteMany({ courseId }).session(session),
            Submission.deleteMany({ courseId }).session(session),
            QuizAttempt.deleteMany({ courseId }).session(session),
            Course.findByIdAndDelete(courseId).session(session)
        ]);

        await session.commitTransaction();
        res.status(200).json({ success: true, message: 'Course and all its content deleted successfully' });
    } catch (error) {
        await session.abortTransaction();
        console.error("Delete Course Error:", error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

const submitForReview = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.educatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to submit this course' });
        }

        if (!['draft', 'rejected'].includes(course.status)) {
            return res.status(400).json({
                message: `Course is already "${course.status}". Only draft or rejected courses can be submitted for review.`
            });
        }

        const moduleCount = await Module.countDocuments({ courseId: course._id });
        if (moduleCount === 0) {
            return res.status(400).json({ message: 'You cannot submit an empty course. Add at least one module first.' });
        }

        const configError = validateGradingConfig(course.gradingConfiguration);
        if (configError) {
            return res.status(400).json({ message: `Invalid Grading Configuration: ${configError}` });
        }

        course.status = 'pending';
        course.adminFeedback = undefined;
        await course.save();

        res.json({ message: 'Course submitted for review successfully.', status: course.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAuthorizedCourseContent = async (req, res) => {
    try {
        const studentId = req.user._id;
        const courseId = req.params.id;

        const enrollment = await Enrollment.findOne({ studentId, courseId });

        if (!enrollment) {
            return res.status(403).json({ success: false, message: "Access denied. Not enrolled in this course." });
        }

        const course = await Course.findById(courseId)
            .populate('educatorId', 'name profilePicture')
            .populate({
                path: 'modules',
                options: { sort: { order: 1 } },
                populate: [
                    { path: 'lessons', options: { sort: { order: 1 } } },
                    { path: 'quizzes', options: { sort: { order: 1 } } },
                    { path: 'assignments', options: { sort: { order: 1 } } }
                ]
            })
            .lean();

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const submissions = await Submission.find({ studentId, courseId }).lean();
        const quizAttempts = await QuizAttempt.find({ studentId, courseId }).lean();

        res.status(200).json({ success: true, data: { course, progress: enrollment, submissions, quizAttempts } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSignedDownloadUrl = async (req, res) => {
    try {
        const { fileUrl } = req.body;
        if (!fileUrl) {
            return res.status(400).json({ success: false, message: 'fileUrl is required' });
        }

        const cloudinary = require('cloudinary').v2;

        const resourceType = fileUrl.includes('/raw/') ? 'raw' : 'image';

        const urlParts = fileUrl.split('/upload/');
        if (urlParts.length < 2) {
            return res.status(400).json({ success: false, message: "Invalid Cloudinary URL" });
        }

        const afterUpload = decodeURIComponent(urlParts[1]);

        const versionMatch = afterUpload.match(/^v(\d+)\//);
        const versionStr = versionMatch ? versionMatch[1] : undefined;
        const withoutVersion = afterUpload.replace(/^v\d+\//, '');

        const options = {
            resource_type: resourceType,
            flags: 'attachment',
            secure: true,
            analytics: false
        };

        if (versionStr) {
            options.version = versionStr;
        }

        const downloadUrl = cloudinary.utils.url(withoutVersion, options);

        return res.status(200).json({ success: true, downloadUrl });
    } catch (error) {
        console.error("Error securing download url: ", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const markLessonComplete = async (req, res) => {
    try {
        const studentId = req.user._id;
        const courseId = req.params.courseId;
        const { lessonId } = req.body;

        const enrollment = await Enrollment.findOne({ studentId, courseId });
        if (!enrollment) {
            return res.status(404).json({ success: false, message: "Enrollment not found" });
        }

        await Enrollment.updateOne(
            { _id: enrollment._id },
            { $addToSet: { completedLessons: lessonId } }
        );

        const updatedEnrollment = await Enrollment.findById(enrollment._id);
        const course = await Course.findById(courseId).populate({
            path: 'modules',
            populate: ['lessons', 'quizzes', 'assignments']
        });

        if (course) {
            let totalItems = 0;
            course.modules.forEach(m => {
                totalItems += (m.lessons?.length || 0) + (m.quizzes?.length || 0) + (m.assignments?.length || 0);
            });

            const completedCount = updatedEnrollment.completedLessons.length + 
                                   updatedEnrollment.completedQuizzes.length + 
                                   updatedEnrollment.completedAssignments.length;
            
            updatedEnrollment.progressPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
            
            if (updatedEnrollment.progressPercentage === 100) {
                updatedEnrollment.status = 'completed';
                updatedEnrollment.completedAt = new Date();
            }
            await updatedEnrollment.save();

            // Trigger Evaluation Engine if progress is 100%
            if (updatedEnrollment.progressPercentage === 100) {
                const pendingWork = await Submission.exists({ 
                    studentId, 
                    courseId, 
                    status: 'submitted' 
                });

                if (!pendingWork) {
                    evaluateCourseCompletion(studentId, courseId).catch(err => console.error("Evaluation Trigger Error:", err));
                }
            }
        }

        res.status(200).json({ success: true, progress: updatedEnrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createCourse,
    getEducatorCourses,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    submitForReview,
    getAuthorizedCourseContent,
    getEducatorDashboardStats,
    getSignedDownloadUrl,
    markLessonComplete,
};

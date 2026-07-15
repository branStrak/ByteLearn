const Quiz = require('../model/Quiz');
const Question = require('../model/Question');
const Module = require('../model/Module');
const Lesson = require('../model/Lesson');
const Assignment = require('../model/Assignment');
const QuizAttempt = require('../model/QuizAttempt');
const Enrollment = require('../model/Enrollment');
const Course = require('../model/Course');
const Submission = require('../model/Submission');
const { evaluateCourseCompletion } = require('../services/evaluationService');
const mongoose = require('mongoose');

const verifyModuleOwnership = async (moduleId, userId) => {
    const module = await Module.findById(moduleId).populate('courseId');
    if (!module) return { error: 'Module not found', status: 404 };
    
    const course = module.courseId;
    const isOwner = course.educatorId.toString() === userId.toString();
    const isCo = course.coInstructors?.some(c => c.userId.toString() === userId.toString());

    if (!isOwner && !isCo) {
        return { error: 'Not authorized to manage content in this module', status: 403 };
    }
    return { module };
};

const createQuizWithQuestions = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let { title, passingScore, duration, attemptsAllowed, questions } = req.body;
        const moduleId = req.params.moduleId;

        if (title) title = title.trim();
        if (!title) {
            return res.status(400).json({ message: 'Quiz title is required' });
        }
        
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'A quiz must contain at least one question' });
        }

        const { error, status } = await verifyModuleOwnership(moduleId, req.user._id);
        if (error) {
            return res.status(status).json({ message: error });
        }

        let totalQuizMarks = 0;
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            
            if (!q.question || q.question.trim() === '') {
                throw new Error(`Question ${i + 1} is missing text.`);
            }

            if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) {
                throw new Error(`Question ${i + 1} must have between 2 and 6 options.`);
            }

            if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
                throw new Error(`Question ${i + 1} has an invalid correctAnswer index.`);
            }

            if (typeof q.marks !== 'number' || q.marks <= 0) {
                throw new Error(`Question ${i + 1} must have positive marks.`);
            }

            totalQuizMarks += q.marks;
        }

        if (passingScore !== undefined && passingScore > totalQuizMarks) {
            throw new Error(`Passing score (${passingScore}) cannot be higher than the total marks available (${totalQuizMarks}).`);
        }

        const [lastLesson, lastAssignment, lastQuiz] = await Promise.all([
            Lesson.findOne({ moduleId }).sort('-order'),
            Assignment.findOne({ moduleId }).sort('-order'),
            Quiz.findOne({ moduleId }).sort('-order')
        ]);

        const maxOrder = Math.max(
            lastLesson?.order || 0,
            lastAssignment?.order || 0,
            lastQuiz?.order || 0
        );

        const newOrder = maxOrder + 1;

        const quiz = (await Quiz.create([{
            moduleId,
            title,
            passingScore: passingScore || totalQuizMarks,
            duration,
            attemptsAllowed: attemptsAllowed || 1,
            order: newOrder
        }], { session }))[0];

        const processedQuestions = questions.map(q => ({
            quizId: quiz._id,
            question: q.question.trim(),
            options: q.options.map(opt => String(opt).trim()),
            correctAnswer: q.correctAnswer,
            marks: q.marks
        }));

        const insertedQuestions = await Question.insertMany(processedQuestions, { session });

        await session.commitTransaction();
        session.endSession();

        const populatedQuiz = await Quiz.findById(quiz._id).populate('questions').lean();

        res.status(201).json({
            success: true,
            data: {
                quiz: populatedQuiz,
                questions: insertedQuestions
            }
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        const status = err.message.includes('Question') || err.message.includes('Passing score') ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

const getQuizzesByModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId);
        if (!module) return res.status(404).json({ message: 'Module not found' });
        const quizzes = await Quiz.findOne({ moduleId: req.params.moduleId })
            ? await Quiz.find({ moduleId: req.params.moduleId }).populate('questions').sort({ order: 1 })
            : [];
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('questions');
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }
        res.status(200).json({ success: true, data: quiz });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const initializeOrResumeQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user._id;

        let attempt = await QuizAttempt.findOne({ studentId, quizId });
        
        if (attempt) {
            return res.status(200).json({ success: true, data: attempt });
        }

        // If no attempt, initialize it
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        const questions = await Question.find({ quizId });
        const answers = questions.map(q => ({
            questionId: q._id,
            selectedOption: null
        }));

        let totalMarksPossible = 0;
        questions.forEach(q => {
            totalMarksPossible += (q.marks || 0);
        });

        try {
            attempt = await QuizAttempt.create({
                studentId,
                quizId,
                courseId: req.query.courseId,
                answers,
                totalQuestions: questions.length,
                totalMarksPossible,
                status: 'in-progress'
            });
        } catch (error) {
            if (error.code === 11000) {
                attempt = await QuizAttempt.findOne({ studentId, quizId });
            } else {
                throw error;
            }
        }

        res.status(200).json({ success: true, data: attempt });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const autoSaveAnswer = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { questionId, selectedOption } = req.body;
        const studentId = req.user._id;

        const updatedAttempt = await QuizAttempt.findOneAndUpdate(
            { studentId, quizId, "answers.questionId": questionId, status: 'in-progress' },
            { $set: { "answers.$.selectedOption": selectedOption } },
            { new: true }
        );

        if (!updatedAttempt) {
            return res.status(404).json({ message: "Active quiz attempt not found or already submitted." });
        }

        res.status(200).json({ success: true, data: updatedAttempt });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const submitFinalQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user._id;

        // 1. Find the in-progress attempt
        const attempt = await QuizAttempt.findOne({ studentId, quizId, status: 'in-progress' });
        if (!attempt) {
            return res.status(404).json({ message: "In-progress quiz attempt not found." });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        const questions = await Question.find({ quizId });
        let score = 0;

        // 2. Grade the answers
        const updatedAnswers = attempt.answers.map(answer => {
            const question = questions.find(q => q._id.toString() === answer.questionId.toString());
            if (!question) return { ...answer, isCorrect: false, marksEarned: 0 };
            
            const isCorrect = question.correctAnswer === answer.selectedOption;
            const marksEarned = isCorrect ? (question.marks || 0) : 0;
            score += marksEarned;
            
            return {
                ...answer.toObject(),
                isCorrect,
                marksEarned
            };
        });

        // 3. Update the document
        attempt.answers = updatedAnswers;
        attempt.score = score;
        attempt.status = 'completed';
        attempt.submittedAt = Date.now();
        await attempt.save();

        // 4. Sync with Enrollment
        const updatedEnrollment = await Enrollment.findOneAndUpdate(
            { studentId, courseId: attempt.courseId },
            { $addToSet: { completedQuizzes: quizId } },
            { new: true }
        );

        if (updatedEnrollment) {
            const course = await Course.findById(attempt.courseId).populate({
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
                await updatedEnrollment.save();

                // Trigger Evaluation Engine if progress is 100%
                if (updatedEnrollment.progressPercentage === 100) {
                    const pendingWork = await Submission.exists({
                        studentId,
                        courseId: attempt.courseId,
                        status: 'submitted'
                    });

                    if (!pendingWork) {
                        evaluateCourseCompletion(studentId, attempt.courseId).catch(err => console.error("Evaluation Trigger Error:", err));
                    }
                }
            }
        }

        res.status(200).json({ 
            success: true, 
            data: attempt,
            progress: updatedEnrollment 
        });

    } catch (err) {
        console.error("Submit Quiz Error:", err);
        res.status(500).json({ message: err.message });
    }
};

const getMyQuizAttempts = async (req, res) => {
    try {
        const studentId = req.user._id;
        const attempts = await QuizAttempt.find({ studentId, status: 'completed' })
            .populate('quizId', 'title')
            .populate('courseId', 'title thumbnail')
            .sort({ submittedAt: -1 });

        res.status(200).json({ success: true, data: attempts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
        
        const { error, status } = await verifyModuleOwnership(quiz.moduleId, req.user._id);
        if (error) return res.status(status).json({ success: false, message: error });
        
        await Quiz.findByIdAndDelete(req.params.id);
        // Cascading delete for questions
        await Question.deleteMany({ quizId: req.params.id });
        
        res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createQuizWithQuestions,
    getQuizzesByModule,
    getQuizById,
    initializeOrResumeQuiz,
    autoSaveAnswer,
    submitFinalQuiz,
    getMyQuizAttempts,
    deleteQuiz
};


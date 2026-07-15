const QuizAttempt = require('../model/QuizAttempt');
const Quiz = require('../model/Quiz');
const Question = require('../model/Question');
const Module = require('../model/Module');
const Course = require('../model/Course');
const Enrollment = require('../model/Enrollment');
const Submission = require('../model/Submission');
const { evaluateCourseCompletion } = require('../services/evaluationService');


/**
 * @desc    Start a new quiz attempt
 * @route   POST /api/quiz-attempts/start
 * @access  Private (Student)
 */
/**
 * @desc    Start or Resume a quiz attempt
 * @route   POST /api/quiz-attempts/start
 * @access  Private (Student)
 */
const startOrResumeAttempt = async (req, res) => {
    try {
        let { quizId, courseId } = req.body;
        const studentId = req.user._id;

        if (!quizId) {
            return res.status(400).json({ message: 'quizId is required' });
        }

        const quiz = await Quiz.findById(quizId).populate('moduleId');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (!courseId && quiz.moduleId) {
            courseId = quiz.moduleId.courseId;
        }

        let attempt = await QuizAttempt.findOne({ studentId, quizId });

        if (attempt) {
            if (attempt.status === 'completed') {
                return res.status(403).json({ 
                    message: 'Quiz already completed', 
                    attempt 
                });
            }
            const questions = await Question.find({ quizId });
            return res.status(200).json({
                quiz,
                questions,
                attempt,
                courseId: attempt.courseId
            });
        }

        const questions = await Question.find({ quizId });
        const totalMarksPossible = questions.reduce((acc, q) => acc + (q.marks || 0), 0);

        try {
            attempt = await QuizAttempt.create({
                studentId,
                quizId,
                courseId,
                status: 'in-progress',
                totalQuestions: questions.length,
                totalMarksPossible,
                answers: []
            });
        } catch (error) {
            if (error.code === 11000) {
                attempt = await QuizAttempt.findOne({ studentId, quizId });
            } else {
                throw error;
            }
        }

        res.status(201).json({
            quiz,
            questions,
            attempt,
            courseId
        });
    } catch (error) {
        console.error('Start/Resume Attempt Error:', error);
        res.status(500).json({ message: error.message || 'Error preparing quiz attempt' });
    }
};

/**
 * @desc    Save quiz progress mid-way
 * @route   PATCH /api/quiz-attempts/save-progress
 * @access  Private (Student)
 */
const saveProgress = async (req, res) => {
    try {
        const { attemptId, answers } = req.body;

        if (!attemptId || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'attemptId and answers array are required' });
        }

        const attempt = await QuizAttempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        if (attempt.status === 'completed') {
            return res.status(403).json({ message: 'Cannot save progress for a completed quiz' });
        }

        attempt.answers = answers;
        await attempt.save();

        res.status(200).json({ message: 'Progress saved successfully' });
    } catch (error) {
        console.error('Save Progress Error:', error);
        res.status(500).json({ message: error.message || 'Error saving progress' });
    }
};

/**
 * @desc    Submit and grade a quiz attempt
 * @route   POST /api/quiz-attempts/submit
 * @access  Private (Student)
 */
const submitAttempt = async (req, res) => {
    try {
        const { attemptId, timeTaken } = req.body; 
        const studentId = req.user._id;

        if (!attemptId) {
            return res.status(400).json({ message: 'attemptId is required' });
        }

        const attempt = await QuizAttempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        if (attempt.status === 'completed') {
            return res.status(403).json({ message: 'Quiz already submitted' });
        }

        const quiz = await Quiz.findById(attempt.quizId);
        const questions = await Question.find({ quizId: attempt.quizId });
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));
        
        let finalScore = 0;
        const gradedAnswers = attempt.answers.map(ans => {
            const question = questionMap.get(ans.questionId.toString());
            
            if (!question) {
                return { ...ans, isCorrect: false, marksEarned: 0 };
            }

            const isCorrect = ans.selectedOption === question.correctAnswer;
            const marksEarned = isCorrect ? (question.marks || 0) : 0;
            
            if (isCorrect) finalScore += marksEarned;

            return {
                questionId: ans.questionId,
                selectedOption: ans.selectedOption,
                isCorrect,
                marksEarned
            };
        });

        attempt.status = 'completed';
        attempt.answers = gradedAnswers;
        attempt.score = finalScore;
        attempt.submittedAt = new Date();
        attempt.timeTaken = timeTaken || attempt.timeTaken;
        
        await attempt.save();

        try {
            const enrollment = await Enrollment.findOne({ studentId, courseId: attempt.courseId });
            if (enrollment) {
                if (!enrollment.completedQuizzes.includes(attempt.quizId)) {
                    enrollment.completedQuizzes.push(attempt.quizId);
                }

                const course = await Course.findById(attempt.courseId).populate({
                    path: 'modules',
                    populate: ['lessons', 'quizzes', 'assignments']
                });

                if (course) {
                    let totalItems = 0;
                    course.modules.forEach(m => {
                        totalItems += (m.lessons?.length || 0) + (m.quizzes?.length || 0) + (m.assignments?.length || 0);
                    });

                    const completedCount = 
                        (enrollment.completedLessons?.length || 0) + 
                        (enrollment.completedQuizzes?.length || 0) + 
                        (enrollment.completedAssignments?.length || 0);
                    
                    enrollment.progressPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
                    
                    if (enrollment.progressPercentage === 100) {
                        enrollment.status = 'completed';
                        enrollment.completedAt = new Date();
                    }
                }
                await enrollment.save();

                // ---------------------------------------------------------
                // Trigger Evaluation Engine if progress is 100%
                // ---------------------------------------------------------
                if (enrollment.progressPercentage === 100) {
                    const pendingWork = await Submission.exists({
                        studentId,
                        courseId: attempt.courseId,
                        status: 'submitted'
                    });

                    if (!pendingWork) {
                        evaluateCourseCompletion(studentId, attempt.courseId).catch(err => console.error("Evaluation Error:", err));
                    }
                }
            }
        } catch (progressErr) {
            console.error("Progress Sync Error after quiz submission:", progressErr);
        }

        res.status(200).json(attempt);
    } catch (error) {
        console.error('Submit Attempt Error:', error);
        res.status(500).json({ message: error.message || 'Error submitting quiz attempt' });
    }
};

/**
 * @desc    Get student's attempt for a quiz
 * @route   GET /api/quiz-attempts/history/:quizId
 * @access  Private (Student)
 */
const getStudentQuizHistory = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user._id;

        const attempt = await QuizAttempt.findOne({ studentId, quizId });
        res.status(200).json(attempt ? [attempt] : []);
    } catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({ message: error.message || 'Error fetching quiz history' });
    }
};

module.exports = { startOrResumeAttempt, submitAttempt, saveProgress, getStudentQuizHistory };

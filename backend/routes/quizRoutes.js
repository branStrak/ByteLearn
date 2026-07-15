const express = require('express');
const router = express.Router({ mergeParams: true });
const { 
    createQuizWithQuestions, 
    getQuizzesByModule, 
    getQuizById, 
    initializeOrResumeQuiz,
    autoSaveAnswer,
    submitFinalQuiz,
    getMyQuizAttempts,
    deleteQuiz
} = require('../controller/quizController');
const { protect, approvedEducator, courseCollaborator } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyQuizAttempts);

router.route('/')
    .post(protect, approvedEducator, courseCollaborator, createQuizWithQuestions)
    .get(getQuizzesByModule);

router.get('/:quizId/start', protect, initializeOrResumeQuiz);
router.patch('/:quizId/save', protect, autoSaveAnswer);
router.post('/:quizId/submit', protect, submitFinalQuiz);
router.get('/:id', protect, getQuizById);
router.delete('/:id', protect, approvedEducator, deleteQuiz);

module.exports = router;

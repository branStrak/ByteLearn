const express = require('express');
const router = express.Router();
const { startOrResumeAttempt, submitAttempt, saveProgress, getStudentQuizHistory } = require('../controller/quizAttemptController');
const { protect } = require('../middleware/authMiddleware');


router.post('/start', protect, startOrResumeAttempt);
router.patch('/save-progress', protect, saveProgress);
router.post('/submit', protect, submitAttempt);
router.get('/history/:quizId', protect, getStudentQuizHistory);

module.exports = router;

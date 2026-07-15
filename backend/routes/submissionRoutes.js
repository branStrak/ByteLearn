const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { submitAssignment, getEducatorSubmissions, gradeSubmission, getSubmissionById, getMySubmissions } = require('../controller/submissionController');
const { approvedEducator } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('file'), submitAssignment);
router.get('/me', protect, getMySubmissions);
router.get('/educator', protect, approvedEducator, getEducatorSubmissions);
router.get('/:submissionId', protect, approvedEducator, getSubmissionById);
router.put('/:submissionId/grade', protect, approvedEducator, gradeSubmission);

module.exports = router;

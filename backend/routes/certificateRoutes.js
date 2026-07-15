const express = require('express');
const router = express.Router();
const { getMyCertificates, getMyCertificateByCourse } = require('../controller/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyCertificates);
router.get('/course/:courseId', protect, getMyCertificateByCourse);

module.exports = router;

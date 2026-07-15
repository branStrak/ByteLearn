const express = require('express');
const router = express.Router();
const { enrollInCourse, getMyCourses, getEducatorRoster, getEnrollmentDetail } = require('../controller/enrollmentController');
const { protect, approvedEducator } = require('../middleware/authMiddleware');

router.post('/enroll', protect, enrollInCourse);
router.get('/my-courses', protect, getMyCourses);
router.get('/educator/roster', protect, approvedEducator, getEducatorRoster);
router.get('/educator/enrollment/:id', protect, approvedEducator, getEnrollmentDetail);

module.exports = router;

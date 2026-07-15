const express = require('express');
const router = express.Router();
const {
    createCourse,
    getEducatorCourses,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    submitForReview,
    reviewCourse,
    getAuthorizedCourseContent,
    getEducatorDashboardStats,
    getSignedDownloadUrl,
    markLessonComplete,
} = require('../controller/courseController');
const { protect, optionalProtect, approvedEducator, educator, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getAllCourses)
    .post(protect, approvedEducator, upload.single('thumbnail'), createCourse);

router.route('/dashboard-stats')
    .get(protect, educator, getEducatorDashboardStats);

router.post('/download-url', protect, getSignedDownloadUrl);

router.route('/my-courses')
    .get(protect, educator, getEducatorCourses);

router.get('/learn/:id', protect, getAuthorizedCourseContent);
router.patch('/learn/:courseId/complete-lesson', protect, markLessonComplete);

router.route('/:id')
    .get(optionalProtect, getCourseById)
    .put(protect, approvedEducator, upload.single('thumbnail'), updateCourse)
    .delete(protect, approvedEducator, deleteCourse);


const moduleRoutes = require('./moduleRoutes');
router.use('/:courseId/modules', moduleRoutes);


router.route('/:id/submit-review')
    .post(protect, approvedEducator, submitForReview);



module.exports = router;

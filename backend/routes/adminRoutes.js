const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAllPendingCourses,
    reviewCourse,
    getAllEducators,
    reviewEducator,
    getAdminStats,
    getAllUsers,
    toggleUserStatus
} = require('../controller/adminController');
const { getAdminEarnings } = require('../controller/earningsController');

// Admin Stats
router.get('/stats', protect, admin, getAdminStats);

// Financials
router.get('/earnings', protect, admin, getAdminEarnings);

// Course Review
router.get('/courses/pending', protect, admin, getAllPendingCourses);
router.put('/courses/:courseId/review', protect, admin, reviewCourse);

// Educator Management
router.get('/educators', protect, admin, getAllEducators);
router.put('/educators/:educatorId/review', protect, admin, reviewEducator);


// User Management
router.get('/users', protect, admin, getAllUsers);
router.patch('/users/:userId/toggle-status', protect, admin, toggleUserStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getStudentDashboardData } = require('../controller/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/student', protect, getStudentDashboardData);

module.exports = router;

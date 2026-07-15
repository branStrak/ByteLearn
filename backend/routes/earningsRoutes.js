const express = require('express');
const router = express.Router();

const { getEarningsDashboard, requestWithdrawal } = require('../controller/earningsController');
const { protect, educator } = require('../middleware/authMiddleware');

router.get('/', protect, educator, getEarningsDashboard);

//for withdraw
router.post('/withdraw', protect, educator, requestWithdrawal);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controller/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/checkout', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;

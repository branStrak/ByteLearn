const express = require('express');
const router = express.Router();
const { sendProgressEmail } = require('../controller/studentCommunicationController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/communication/send-progress-email — Educator sends a formal academic progress email
router.post('/send-progress-email', protect, sendProgressEmail);

module.exports = router;

const express = require('express');
const router = express.Router();
const { executeCode } = require('../controller/codeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/run', protect, executeCode);

module.exports = router;

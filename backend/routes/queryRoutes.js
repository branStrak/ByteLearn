const express = require('express');
const router = express.Router();
const { 
  createQuery, 
  getStudentQueries, 
  getEducatorQueries,
  generateAIDrafts,
  resolveQuery,
  markQueryRead 
} = require('../controller/queryController');
const { protect, approvedEducator } = require('../middleware/authMiddleware');

// Student Routes
router.route('/')
  .post(protect, createQuery)
  .get(protect, getStudentQueries);

router.patch('/:id/read', protect, markQueryRead);

// Educator Routes
router.get('/educator', protect, approvedEducator, getEducatorQueries);

router.post('/:queryId/generate-drafts', protect, approvedEducator, generateAIDrafts);
router.patch('/:queryId/reply', protect, approvedEducator, resolveQuery);

// Legacy/Alternative ID mapping
router.patch('/:id/resolve', protect, approvedEducator, resolveQuery);

module.exports = router;

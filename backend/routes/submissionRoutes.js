const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createSubmission, listApprovedSubmissions } = require('../controllers/submissionController');

const router = express.Router();

// Community feed (admin-approved only)
router.get('/', protect, listApprovedSubmissions);

// User submits news for review
router.post('/', protect, createSubmission);

module.exports = router;

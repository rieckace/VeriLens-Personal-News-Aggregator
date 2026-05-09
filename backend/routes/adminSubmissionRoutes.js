const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  listSubmissionsForAdmin,
  approveSubmission,
  rejectSubmission,
} = require('../controllers/submissionController');

const router = express.Router();

router.get('/', protect, adminOnly, listSubmissionsForAdmin);
router.post('/:id/approve', protect, adminOnly, approveSubmission);
router.post('/:id/reject', protect, adminOnly, rejectSubmission);

module.exports = router;

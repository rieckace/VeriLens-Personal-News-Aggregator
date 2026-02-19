const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getPreferences, updatePreferences, getBookmarks, getHistory } = require('../controllers/userController');

const router = express.Router();

router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);
router.get('/bookmarks', protect, getBookmarks);
router.get('/history', protect, getHistory);

module.exports = router;

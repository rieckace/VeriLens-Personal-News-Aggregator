const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  refreshArticles,
  getPersonalizedFeed,
  getArticleById,
  markRead,
  addBookmark,
  removeBookmark,
} = require('../controllers/articleController');

const router = express.Router();

router.post('/refresh', protect, refreshArticles);
router.get('/feed', protect, getPersonalizedFeed);
router.get('/:id', protect, getArticleById);
router.post('/:id/read', protect, markRead);
router.post('/:id/bookmark', protect, addBookmark);
router.delete('/:id/bookmark', protect, removeBookmark);

module.exports = router;

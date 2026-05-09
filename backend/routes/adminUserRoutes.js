const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { setUserRoleByEmail } = require('../controllers/adminUserController');

const router = express.Router();

// Set role for a user (by email)
router.post('/set-role', protect, adminOnly, setUserRoleByEmail);

module.exports = router;

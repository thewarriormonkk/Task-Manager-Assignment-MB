const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  logout,
  getUsers
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);
router.get('/', protect, getUsers);

module.exports = router;

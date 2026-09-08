const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route: Login
router.post('/login', authController.login);

// HR Admin only: Onboard/Register new employee (Sprint 1)
router.post('/register', authenticate, authorize('HR Admin'), authController.register);

// Authenticated user: View own profile
router.get('/me', authenticate, authController.getMe);

module.exports = router;

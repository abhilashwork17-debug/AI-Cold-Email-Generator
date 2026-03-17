const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController')

// Register a new user
router.post('/register', authController.registerUser);

// Login a user
router.post('/login',authController.login);

// Verify OTP
router.post('/verify-otp',authController.verifyOTP);

module.exports = router;
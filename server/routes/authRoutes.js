const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController')

// Register a new user
router.post('/register', authController.registerUser);

// Verify OTP
router.post('/verify-otp', authController.verifyOTP);

// Login a user
router.post('/login', authController.loginUser);


module.exports = router;
const User = require('../models/User')
const sendEmail = require('../utils/sendEmail.js')
const jwt = require('jsonwebtoken')

const generateAuthToken = function(id){
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  return token;
}

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be atleast 6 characters' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP valid for 10 minutes
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ FIX: Save OTP in DB
    const user = await User.create({ username, email, password, otp, otpExpiry });

    // OTP Sending
    try {
      await sendEmail({
        to: email,
        subject: 'Your OTP Code for AI COLD MAIL GENERATOR',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes only.`
      });
    } catch (error) {
      console.log({ message: 'Error in sending OTP', error: error.message });
    }

    // ✅ FIX: Only one response
    return res.status(201).json({
      message: 'User registered successfully',
      user: { username: user.username, email: user.email }
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
}


exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // ✅ FIX: correct expiry message
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.isVerified = true;

    // Optional cleanup 
    user.otp = null;
    user.otpExpiry = null;

    await user.save();
    const token  = generateAuthToken(user._id);
    return res.status(200).json({ token,message: 'OTP verified successfully' });

  } catch (error) {
    return res.status(500).json({
      message: 'Error verifying OTP',
      error: error.message
    });
  }
}

exports.LoginUser = async (req, res) => {

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password +isVerified');

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'User not verified. Please verify your email first.' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    return res.status(200).json({ message: 'Login successful', user: { username: user.username, email: user.email } });
  }
  catch (error) {
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }

}
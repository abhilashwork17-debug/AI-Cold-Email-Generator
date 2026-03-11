const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isValidElement } = require('react');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  username: {
    type: String,
    require: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  }
});

// Hash password before saving
userSchema.pre('save',async function (next) {
  if(!this.isModified('password')){
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password,salt);
  next();
});

// Compare password before login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword,this.password);
}

const User = mongoose.model('User',userSchema);
module.exports = User;
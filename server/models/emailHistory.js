const mongoose = require('mongoose');


const EmailHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    require: true
  },
  emailBody: {
    type: String,
    required: true
  },
  linkedInDM: {
    type: String,
    required: true
  },
  followUpEmail: {
    type: String,
    required: true
  }
},{ timestamp: true });

const EmailHistory = mongoose.model('EmailHistory', EmailHistorySchema);
module.exports = EmailHistory;
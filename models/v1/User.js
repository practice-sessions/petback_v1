const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  contactnumber: {
    type: String,
    required: 'Your contact number is required please',
    unique: true
  },
  email: {
    type: String,
  },
  password: {
    type: String,
   // required: true
  },
  avatar: {
   type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('user', UserSchema);

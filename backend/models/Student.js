const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: ''
  },
  branch: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
   userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);

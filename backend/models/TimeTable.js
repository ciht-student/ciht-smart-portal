const mongoose = require('mongoose');

const timeTableSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TimeTable', timeTableSchema);
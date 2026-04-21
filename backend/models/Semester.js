const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  subjects: [{
    name: String,
    code: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Semester', semesterSchema);
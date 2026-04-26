const express = require('express');
const router = express.Router();
const { protect, student } = require('../middleware/auth');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Notice = require('../models/Notice');
const TimeTable = require('../models/TimeTable');

router.use(protect, student);

// Get Student Profile
router.get('/profile', async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentId);
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Attendance
router.get('/attendance', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const records = await Attendance.find({ studentId: student._id });
    const totalLectures = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const percentage = totalLectures > 0 ? (present / totalLectures) * 100 : 0;
    
    res.json({
      attendance,
      totalLectures,
      present,
      percentage: percentage.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Marks
router.get('/marks', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.user.studentId });
    const mstMarks = marks.filter(m => m.examType === 'mst');
    const semesterMarks = marks.filter(m => m.examType === 'semester');
    
    res.json({
      mstMarks,
      semesterMarks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Notices
router.get('/notices', async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentId);
    const notices = await Notice.find({ 
      $or: [{ branch: student.branch }, { branch: 'all' }] 
    }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Time Table
router.get('/timetable', async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentId);
    const timetable = await TimeTable.findOne({ 
      branch: student.branch,
      semester: student.semester 
    });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

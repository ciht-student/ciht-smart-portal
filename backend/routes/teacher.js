const express = require('express');
const router = express.Router();
const { protect, teacher } = require('../middleware/auth');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Notice = require('../models/Notice');
const TimeTable = require('../models/TimeTable');

router.use(protect, teacher);

// Get teacher's branch students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find({ branch: req.user.branch });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add/Edit Student
router.post('/students', async (req, res) => {
  try {
    const student = new Student({ ...req.body, branch: req.user.branch });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Attendance Management
router.post('/attendance', async (req, res) => {
  try {
    const { studentId, date, status, subject } = req.body;
    const attendance = new Attendance({
      studentId,
      branch: req.user.branch,
      date,
      status,
      subject
    });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/attendance/:studentId', async (req, res) => {
  try {
    const attendance = await Attendance.find({ 
      studentId: req.params.studentId,
      branch: req.user.branch 
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Marks Management
router.post('/marks', async (req, res) => {
  try {
    const marks = new Marks(req.body);
    await marks.save();
    res.status(201).json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/marks/:studentId', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Notices (Read only)
router.get('/notices', async (req, res) => {
  try {
    const notices = await Notice.find({ 
      $or: [{ branch: req.user.branch }, { branch: 'all' }] 
    }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Time Table
router.get('/timetable', async (req, res) => {
  try {
    const timetable = await TimeTable.findOne({ branch: req.user.branch });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/timetable', async (req, res) => {
  try {
    const timetable = new TimeTable({ ...req.body, branch: req.user.branch });
    await timetable.save();
    res.status(201).json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ branch: req.user.branch });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({ 
      branch: req.user.branch,
      date: { $gte: today }
    });
    
    res.json({
      totalStudents,
      todayAttendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
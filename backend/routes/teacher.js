const express = require('express');
const router = express.Router();
const { protect, teacher } = require('../middleware/auth');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Notice = require('../models/Notice');
const TimeTable = require('../models/TimeTable');

router.use(protect, teacher);

// ================= STUDENTS =================

// Get teacher's branch students
router.get('/students', async (req, res) => {
  try {
    if (!req.user.branch) {
      return res.status(400).json({ message: "User branch not found" });
    }

    const students = await Student.find({ branch: req.user.branch });
    res.json(students);

  } catch (error) {
    console.log("GET STUDENTS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Add Student
router.post('/students', async (req, res) => {
  try {
    const { name, rollNumber, phone, address, semester } = req.body;

    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    // ✅ Validation
    if (!name || !rollNumber || !phone || !address || !semester) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.user.branch) {
      return res.status(400).json({ message: "Branch not found in user" });
    }

    // ✅ Duplicate check
    const existing = await Student.findOne({ rollNumber });
    if (existing) {
      return res.status(400).json({ message: "Roll number already exists" });
    }

    const student = new Student({
      name,
      rollNumber,
      phone,
      address,
      semester,
      branch: req.user.branch
    });

    await student.save();

    res.status(201).json(student);

  } catch (error) {
    console.log("ADD STUDENT ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Update Student
router.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(student);

  } catch (error) {
    console.log("UPDATE STUDENT ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Delete Student
router.delete('/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });

  } catch (error) {
    console.log("DELETE STUDENT ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ================= ATTENDANCE =================

router.post('/attendance', async (req, res) => {
  try {
    const { studentId, date, status, subject } = req.body;

    if (!studentId || !date || !status || !subject) {
      return res.status(400).json({ message: "All fields are required" });
    }

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
    console.log("ATTENDANCE ERROR:", error.message);
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
    console.log("GET ATTENDANCE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ================= MARKS =================

router.post('/marks', async (req, res) => {
  try {
    const marks = new Marks(req.body);
    await marks.save();

    res.status(201).json(marks);

  } catch (error) {
    console.log("MARKS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

router.get('/marks/:studentId', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId });
    res.json(marks);

  } catch (error) {
    console.log("GET MARKS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ================= NOTICES =================

router.get('/notices', async (req, res) => {
  try {
    const notices = await Notice.find({
      $or: [{ branch: req.user.branch }, { branch: 'all' }]
    }).sort({ createdAt: -1 });

    res.json(notices);

  } catch (error) {
    console.log("NOTICES ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ================= TIMETABLE =================

router.get('/timetable', async (req, res) => {
  try {
    const timetable = await TimeTable.findOne({ branch: req.user.branch });
    res.json(timetable);

  } catch (error) {
    console.log("TIMETABLE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post('/timetable', async (req, res) => {
  try {
    const timetable = new TimeTable({
      ...req.body,
      branch: req.user.branch
    });

    await timetable.save();

    res.status(201).json(timetable);

  } catch (error) {
    console.log("ADD TIMETABLE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ================= STATS =================

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
    console.log("STATS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

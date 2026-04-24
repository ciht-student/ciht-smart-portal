const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');

// ==============================
// LOGIN ROUTE (FIXED)
// ==============================
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // 1. Check input
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Find user ONLY by username (IMPORTANT FIX)
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Role check (separate)
    if (user.role !== role) {
      return res.status(401).json({ message: 'Invalid role' });
    }

    // 4. Password check (bcrypt compare via schema method)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 5. Token generate
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: process.env.JWT_EXPIRE || "1d" }
    );

    // 6. Extra user data (safe)
    let userData = {};

    if (role === 'student' && user.studentId) {
      const student = await Student.findById(user.studentId);
      if (student) userData = student.toObject();
    }

    if (role === 'teacher' && user.teacherId) {
      const teacher = await Teacher.findById(user.teacherId);
      if (teacher) userData = teacher.toObject();
    }

    // 7. Final response
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        ...userData
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// CHECK USERNAME
// ==============================
router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username required' });
    }

    const existingUser = await User.findOne({ username });

    res.json({ available: !existingUser });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

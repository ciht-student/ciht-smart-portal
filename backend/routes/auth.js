const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    let userData = {};
    if (role === 'student' && user.studentId) {
      userData = await Student.findById(user.studentId);
    } else if (role === 'teacher' && user.teacherId) {
      userData = await Teacher.findById(user.teacherId);
    }
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        ...userData._doc
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check username availability
router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    const existingUser = await User.findOne({ username });
    res.json({ available: !existingUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// 🔥 Debug ENV
console.log("ENV:", process.env.MONGO_URI);

// 🔥 MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.log("DB error", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔥 FRONTEND SERVE (IMPORTANT)
app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/upload', require('./routes/upload'));

// 🔥 HOME PAGE (Website open yahan se hoga)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

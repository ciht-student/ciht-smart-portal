// ================================
// 1. ENV CONFIG
// ================================
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ================================
// 2. IMPORT MODELS
// ================================
require("./models/User");

// ================================
// 3. DATABASE CONNECTION
// ================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB connected");
  })
  .catch(err => {
    console.error("❌ DB error:", err.message);
    process.exit(1);
  });

// ================================
// 4. MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, "../frontend")));

// ================================
// 5. ROUTES
// ================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/upload', require('./routes/upload'));

// ================================
// 6. HOME ROUTE
// ================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ================================
// 7. ERROR HANDLING
// ================================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    message: err.message || "Something went wrong!"
  });
});

// ================================
// 8. SERVER START
// ================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

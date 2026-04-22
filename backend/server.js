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
// 2. DEBUG ENV (REMOVE LATER IF YOU WANT)
// ================================
console.log("ENV:", process.env.MONGO_URI);

// ================================
// 3. DATABASE CONNECTION
// ================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected");

    // ================================
    // 3.1 TEMP ADMIN CREATION (REMOVE AFTER FIRST SUCCESSFUL RUN)
    // ================================
    createAdmin(); // 👈 RUN ONLY ONCE (IMPORTANT)
  })
  .catch(err => console.log("DB error", err));


// ================================
// 4. IMPORT MODELS (FOR ADMIN CREATE)
// ================================
const User = require("./models/User");
const bcrypt = require("bcryptjs");

// ================================
// 4.1 TEMP FUNCTION: CREATE DEFAULT ADMIN
// 👉 REMOVE THIS AFTER FIRST DEPLOY SUCCESS
// ================================
async function createAdmin() {
  try {
    const existing = await User.findOne({ username: "admin" });

    if (!existing) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        username: "admin",
        password: hashedPassword,
        role: "admin"
      });

      console.log("✅ Default admin created");
    } else {
      console.log("⚠️ Admin already exists");
    }
  } catch (err) {
    console.log("Admin create error:", err.message);
  }
}


// ================================
// 5. MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));


// ================================
// 6. ROUTES
// ================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/upload', require('./routes/upload'));


// ================================
// 7. HOME ROUTE (FRONTEND ENTRY)
// ================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});


// ================================
// 8. ERROR HANDLING
// ================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Something went wrong!"
  });
});


// ================================
// 9. SERVER START
// ================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

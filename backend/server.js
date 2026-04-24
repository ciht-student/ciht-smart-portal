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
// 2. DEBUG ENV
// ================================
console.log("ENV:", process.env.MONGO_URI);

// ================================
// 3. IMPORT MODELS
// ================================
const User = require("./models/User");

// ================================
// 4. DATABASE CONNECTION
// ================================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("DB connected");

    // 👇 ensure admin is created properly
    await createAdmin();
  })
  .catch(err => console.log("DB error", err));


// ================================
// 5. CREATE DEFAULT ADMIN (FIXED)
// ================================
async function createAdmin() {
  try {
    const existing = await User.findOne({ username: "admin" });

    if (!existing) {
      await User.create({
        username: "admin",
        password: "admin123", // ✅ plain (NO HASH HERE)
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
// 6. MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, "../frontend")));


// ================================
// 7. ROUTES
// ================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/upload', require('./routes/upload'));


// ================================
// 8. HOME ROUTE
// ================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});


// ================================
// 9. ERROR HANDLING
// ================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Something went wrong!"
  });
});


// ================================
// 10. SERVER START
// ================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

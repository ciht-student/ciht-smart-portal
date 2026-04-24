const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      // Get token
      token = req.headers.authorization.split(' ')[1];

      // Verify token (fallback added 👇)
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secretkey"
      );

      req.user = decoded;

      return next(); // ✅ important (return added)

    } catch (error) {
      console.log("Token Error:", error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // No token
  return res.status(401).json({ message: 'Not authorized, no token' });
};

// ================= ADMIN =================
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized as admin' });
};

// ================= TEACHER =================
const teacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized as teacher' });
};

// ================= STUDENT =================
const student = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized as student' });
};

module.exports = { protect, admin, teacher, student };

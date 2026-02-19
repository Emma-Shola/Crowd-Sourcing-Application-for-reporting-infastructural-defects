const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobs");
const analyticsRoutes = require("./routes/analytics");

dotenv.config();

const app = express();

/* ===================== MIDDLEWARE ===================== */
// ✅ PERFECT CORS CONFIGURATION - WORKS FOR ALL ORIGINS
app.use(cors({
  origin: true,  // Dynamically echoes the requesting origin
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===================== DATABASE CONNECTION ===================== */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
connectDB();

/* ===================== API ROUTES ===================== */
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/analytics", analyticsRoutes);

/* ===================== HEALTH CHECK ===================== */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

/* ===================== ROOT TEST ===================== */
app.get("/", (req, res) => {
  res.send("Job Application Tracker API is running");
});

/* ===================== ERROR HANDLER ===================== */
app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/* ===================== 404 HANDLER ===================== */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* ===================== START SERVER ===================== */
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 CORS: All origins allowed with credentials\n`);
});

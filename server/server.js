const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/userRoutes");
const defectRoutes = require("./routes/defectRoutes");

dotenv.config();
connectDB();

const app = express();

/* ===================== MIDDLEWARE ===================== */
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===================== STATIC UPLOADS ===================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===================== API ROUTES ===================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/defects", defectRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running"
  });
});

/* ===================== FRONTEND (REACT BUILD) ===================== */
/**
 * IMPORTANT:
 * server.js is inside /server
 * client/dist is ONE LEVEL UP
 */
const frontendPath = path.join(__dirname, "..", "client", "dist");

app.use(express.static(frontendPath));

/**
 * EXPRESS 5 SAFE CATCH-ALL
 * (NO wildcards, NO regex, NO crashes)
 */
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* ===================== START SERVER ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

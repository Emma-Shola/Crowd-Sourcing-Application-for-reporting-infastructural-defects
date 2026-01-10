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

// ========== CORS CONFIGURATION ==========
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== SERVE UPLOADS ==========
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== API ROUTES ==========
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/defects", defectRoutes);

// ========== HEALTH CHECK ==========
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});


// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ===== TEST ROUTES =====
app.get("/", (req, res) => {
  res.send("Backend root is working");
});

app.get("/test", (req, res) => {
  res.send("SERVER IS WORKING ON RENDER");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// ===== API ROUTES =====
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/defects", defectRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

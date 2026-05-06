const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Middleware FIRST — before any routes
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./src/routes/auth");
const courseRoutes = require("./src/routes/courses");
const plannerRoutes = require("./src/routes/planner");
const completedRoutes = require("./src/routes/completedRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/completed", completedRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
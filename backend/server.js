const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const authRoutes   = require("./src/routes/auth");
const courseRoutes = require("./src/routes/courses");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth",    authRoutes);
app.use("/api/courses", courseRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
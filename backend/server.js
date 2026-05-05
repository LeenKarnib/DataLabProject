const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//routes

//Prerequisite Checker
const prerequisiteRoutes = require("./src/routes/prerequisites");
app.use("/api/prerequisites", prerequisiteRoutes);

//check..
app.get("/", (req, res) => {
  res.json({ message: "DegreeMap API is running" });
});

//Starting the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

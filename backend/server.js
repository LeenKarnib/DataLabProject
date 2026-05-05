const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 BACKEND RUNNING");

// HashMap
let courseCatalog = {};

// HashSet
let completedCourses = new Set();

// ROOT
app.get("/", (req, res) => {
    res.send("Backend is working ✅");
});

// ADD COURSE (FIXED)
app.post("/add-course", (req, res) => {
    let { code, name, credits, department } = req.body;

    // normalize
    code = code?.trim().toUpperCase();
    name = name?.trim();

    // 🚨 VALIDATION
    if (!code || !name) {
        return res.status(400).json({
            message: "Code and Name are required"
        });
    }

    courseCatalog[code] = { code, name, credits, department };
    console.log("Added:", code);

    res.json({ message: "Added" });
});
// GET AVAILABLE
app.get("/available", (req, res) => {
    const available = Object.values(courseCatalog).filter(
        c => !completedCourses.has(c.code.trim().toUpperCase())
    );

    res.json(available);
});

// GET COMPLETED
app.get("/completed", (req, res) => {
    const completed = Object.values(courseCatalog).filter(
        c => completedCourses.has(c.code.trim().toUpperCase())
    );

    res.json(completed);
});

// COMPLETE (FIXED)
app.post("/complete/:code", (req, res) => {
    const code = req.params.code.trim().toUpperCase(); // 🔥 FIX

    completedCourses.add(code);
    console.log("Completed:", code);

    res.json({ message: "Completed" });
});

// DELETE (FIXED)
app.delete("/delete/:code", (req, res) => {
    const code = req.params.code.trim().toUpperCase(); // 🔥 FIX

    delete courseCatalog[code];
    completedCourses.delete(code);

    console.log("Deleted:", code);

    res.json({ message: "Deleted" });
});

// START SERVER
app.listen(5000, () => {
    console.log("🚀 Backend running on port 5000");
});
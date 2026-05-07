const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const SCHEDULE = [
  { label: "Fall 1",   season: "fall",   type: "normal",         max: 18 },
  { label: "Spring 1", season: "spring", type: "normal",         max: 18 },
  { label: "Summer 1", season: "summer", type: "summer_limited", max: 9  },
  { label: "Fall 2",   season: "fall",   type: "normal",         max: 18 },
  { label: "Spring 2", season: "spring", type: "normal",         max: 18 },
  { label: "Summer 2", season: "summer", type: "summer_limited", max: 9  },
  { label: "Fall 3",   season: "fall",   type: "normal",         max: 18 },
  { label: "Spring 3", season: "spring", type: "normal",         max: 18 },
  { label: "Summer 3", season: "summer", type: "summer_pe",      max: 6  },
  { label: "Fall 4",   season: "fall",   type: "normal",         max: 18 },
  { label: "Spring 4", season: "spring", type: "normal",         max: 18 },
  { label: "Fall 5",   season: "fall",   type: "normal",         max: 18 },
  { label: "Spring 5", season: "spring", type: "normal",         max: 18 },
];

const LABEL_TO_INDEX = Object.fromEntries(SCHEDULE.map((s, i) => [s.label, i]));

router.get("/:major/custom", authMiddleware, async (req, res) => {
  const major = req.params.major.toUpperCase();
  const userId = req.user.id;
  if (!["COE", "ELE", "MCE"].includes(major))
    return res.status(400).json({ message: "Invalid major." });
  try {
    const [courses] = await db.query(
      `SELECT c.code, c.name, c.credits, c.department, c.offered_semesters,
              c.course_type, c.year_standing, mr.requirement_type
       FROM major_requirements mr
       JOIN courses c ON mr.course_code = c.code
       WHERE mr.major = ?`, [major]
    );
    const [prereqRows] = await db.query(
      `SELECT p.course_code, p.prereq_code FROM prerequisites p
       WHERE p.course_code IN (SELECT course_code FROM major_requirements WHERE major = ?)`, [major]
    );
    const prereqMap = {};
    for (const row of prereqRows) {
      if (!prereqMap[row.course_code]) prereqMap[row.course_code] = [];
      prereqMap[row.course_code].push(row.prereq_code);
    }
    const [completedRows] = await db.query(
      "SELECT course_code FROM completed_courses WHERE user_id = ?", [userId]
    );
    const completedSet = new Set(completedRows.map((r) => r.course_code));
    const [planRows] = await db.query(
      "SELECT course_code, semester_label FROM user_plans WHERE user_id = ? AND major = ?",
      [userId, major]
    );
    const savedPlan = Object.fromEntries(planRows.map((r) => [r.course_code, r.semester_label]));
    const semesters = {};
    for (const slot of SCHEDULE) semesters[slot.label] = [];
    const unscheduled = [];
    for (const course of courses) {
      const enriched = { ...course, completed: completedSet.has(course.code), prereqs: prereqMap[course.code] || [] };
      if (savedPlan[course.code] && semesters[savedPlan[course.code]]) {
        semesters[savedPlan[course.code]].push(enriched);
      } else {
        unscheduled.push(enriched);
      }
    }
    res.json({ semesters, unscheduled, prereqMap, schedule: SCHEDULE });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:major/custom", authMiddleware, async (req, res) => {
  const major = req.params.major.toUpperCase();
  const userId = req.user.id;
  const { assignments } = req.body;
  if (!Array.isArray(assignments))
    return res.status(400).json({ message: "assignments must be an array" });
  try {
    await db.query("DELETE FROM user_plans WHERE user_id = ? AND major = ?", [userId, major]);
    const rows = assignments.filter((a) => a.semester_label);
    if (rows.length > 0) {
      const values = rows.map((a) => [userId, major, a.course_code, a.semester_label]);
      await db.query("INSERT INTO user_plans (user_id, major, course_code, semester_label) VALUES ?", [values]);
    }
    res.json({ message: "Plan saved", count: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:major/custom", authMiddleware, async (req, res) => {
  const major = req.params.major.toUpperCase();
  const userId = req.user.id;
  try {
    await db.query("DELETE FROM user_plans WHERE user_id = ? AND major = ?", [userId, major]);
    res.json({ message: "Plan reset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
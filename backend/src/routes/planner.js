// backend/src/routes/planner.js

const express = require("express");
const router = express.Router();
const pool = require("../db");
const Graph = require("../datastructures/Graph");
const BFSPlanner = require("../datastructures/BFSPlanner");
const authMiddleware = require("../middleware/auth");

/**
 * GET /api/planner/:major
 *
 * Returns a BFS-generated semester plan for the authenticated user.
 * Uses their major's required courses and their completed courses.
 *
 * Response:
 * {
 *   major: "COE",
 *   totalSemesters: 8,
 *   totalCreditsRemaining: 87,
 *   semesters: [
 *     {
 *       semesterNumber: 1,
 *       totalCredits: 16,
 *       courseCount: 5,
 *       courses: [{ code, name, credits, course_type, department }, ...]
 *     },
 *     ...
 *   ],
 *   unplaced: []   // courses BFS couldn't schedule (should be empty in normal flow)
 * }
 */
router.get("/:major", authMiddleware, async (req, res) => {
  const { major } = req.params;

  // Validate major
  const validMajors = ["COE", "ELE", "MCE"];
  if (!validMajors.includes(major.toUpperCase())) {
    return res.status(400).json({ message: "Invalid major. Must be COE, ELE, or MCE." });
  }

  const userId = req.user.id;

  try {
    // 1. Fetch all prerequisites (full table — needed to build the graph)
    const [prereqRows] = await pool.query(
      "SELECT course_code, prereq_code FROM prerequisites"
    );

    // 2. Fetch all courses required for this major (with full course details)
    const [courseRows] = await pool.query(
      `SELECT c.code, c.name, c.credits, c.department, c.offered_semesters, c.course_type, c.year_standing
       FROM courses c
       JOIN major_requirements mr ON c.code = mr.course_code
       WHERE mr.major = ?`,
      [major.toUpperCase()]
    );

    // 3. Fetch completed courses for this user
    const [completedRows] = await pool.query(
      "SELECT course_code FROM completed_courses WHERE user_id = ?",
      [userId]
    );

    // 4. Build the prerequisite graph using teammate 2's Graph class
    const graph = Graph.buildFromDB(prereqRows, courseRows);

    // 5. Extract codes
    const requiredCodes = courseRows.map((r) => r.code);
    const completedCodes = completedRows.map((r) => r.course_code);

    // 6. Run BFS
    const { semesters, unplaced } = BFSPlanner.generatePlan(
      graph,
      completedCodes,
      requiredCodes,
      courseRows // pass full course objects for rich response
    );

    // 7. Enrich with per-semester summaries
    const semesterSummaries = BFSPlanner.getSemesterSummaries(semesters);

    // 8. Compute total credits remaining
    const totalCreditsRemaining = semesterSummaries.reduce(
      (sum, s) => sum + s.totalCredits,
      0
    );

    return res.json({
      major: major.toUpperCase(),
      totalSemesters: semesters.length,
      totalCreditsRemaining,
      semesters: semesterSummaries,
      unplaced,
    });
  } catch (err) {
    console.error("[PlannerRoute] Error generating plan:", err);
    return res.status(500).json({ message: "Failed to generate semester plan." });
  }
});

/**
 * GET /api/planner/:major/raw
 *
 * Same as above but returns flat arrays of course codes per semester.
 * Useful for debugging or lightweight clients.
 */
router.get("/:major/raw", authMiddleware, async (req, res) => {
  const { major } = req.params;
  const userId = req.user.id;

  try {
    const [prereqRows] = await pool.query("SELECT course_code, prereq_code FROM prerequisites");
    const [courseRows] = await pool.query(
      `SELECT c.code FROM courses c
       JOIN major_requirements mr ON c.code = mr.course_code
       WHERE mr.major = ?`,
      [major.toUpperCase()]
    );
    const [completedRows] = await pool.query(
      "SELECT course_code FROM completed_courses WHERE user_id = ?",
      [userId]
    );

    const graph = Graph.buildFromDB(prereqRows, courseRows);
    const { semesters, unplaced } = BFSPlanner.generatePlan(
      graph,
      completedRows.map((r) => r.course_code),
      courseRows.map((r) => r.code)
    );

    return res.json({
      semesters: semesters.map((sem) => sem.map((c) => c.code || c)),
      unplaced,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to generate plan." });
  }
});

module.exports = router;
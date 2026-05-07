const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const HashMap = require("../datastructures/HashMap");
const HashSet = require("../datastructures/HashSet");

// In-memory catalog — loaded once on server startup
const catalogMap = new HashMap();

async function loadCatalog() {
  const [courses] = await db.query("SELECT * FROM courses");
  courses.forEach((course) => {
    catalogMap.set(course.code, course);
  });
  console.log(`Catalog loaded: ${courses.length} courses in HashMap`);
}

loadCatalog();

// ─────────────────────────────────────────
// GET /api/courses
// Returns all courses in the catalog
// ─────────────────────────────────────────
router.get("/", (req, res) => {
  res.json(catalogMap.getAll());
});

// ─────────────────────────────────────────
// GET /api/courses/search?q=signals
// Full-text search by code or name
// ─────────────────────────────────────────
router.get("/search", (req, res) => {
  const q = (req.query.q || "").toUpperCase();
  if (!q) return res.json(catalogMap.getAll());

  const results = catalogMap
    .getAll()
    .filter(
      (c) =>
        c.code.toUpperCase().includes(q) ||
        c.name.toUpperCase().includes(q)
    );
  res.json(results);
});

// ─────────────────────────────────────────
// GET /api/courses/dept/:dept
// Filter by department e.g. COE, ELE, MCE, MTH
// ─────────────────────────────────────────
router.get("/dept/:dept", (req, res) => {
  const dept = req.params.dept.toUpperCase();
  const results = catalogMap
    .getAll()
    .filter((c) => c.department.toUpperCase() === dept);
  res.json(results);
});

// ─────────────────────────────────────────
// GET /api/courses/major/:major/graph
// Returns all courses for a major + their prereq edges
// Used by the React Flow graph visualization
// ─────────────────────────────────────────
router.get("/major/:major/graph", async (req, res) => {
  const major = req.params.major.toUpperCase();

  if (!["COE", "ELE", "MCE"].includes(major)) {
    return res.status(400).json({ message: "Invalid major. Use COE, ELE, or MCE." });
  }

  try {
    // All courses required for this major
    const [courses] = await db.query(
      `SELECT mr.course_code AS code, c.name, c.credits, c.department,
              c.year_standing, mr.requirement_type
       FROM major_requirements mr
       JOIN courses c ON mr.course_code = c.code
       WHERE mr.major = ?`,
      [major]
    );

    // Build a set of valid codes so we only draw edges within the major
    const codeSet = new HashSet();
    courses.forEach((c) => codeSet.add(c.code));

    // All prereq relationships where both ends are in this major's course list
    const [prereqs] = await db.query(
      `SELECT p.course_code AS target, p.prereq_code AS source
       FROM prerequisites p
       WHERE p.course_code IN (
         SELECT course_code FROM major_requirements WHERE major = ?
       )`,
      [major]
    );

    // Filter edges: only include if the source course is also in this major
    const edges = prereqs.filter((e) => codeSet.has(e.source));

    res.json({ courses, edges });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// ─────────────────────────────────────────
// GET /api/courses/major/:major
// Returns all required courses for a major (COE, ELE, MCE)
// Uses major_requirements table
// ─────────────────────────────────────────
router.get("/major/:major", async (req, res) => {
  const major = req.params.major.toUpperCase();

  if (!["COE", "ELE", "MCE"].includes(major)) {
    return res.status(400).json({ message: "Invalid major. Use COE, ELE, or MCE." });
  }

  try {
    const [rows] = await db.query(
      `SELECT mr.course_code, mr.requirement_type, c.*
       FROM major_requirements mr
       JOIN courses c ON mr.course_code = c.code
       WHERE mr.major = ?
       ORDER BY mr.requirement_type, c.code`,
      [major]
    );

    // Group by requirement_type using HashMap
    const grouped = new HashMap();
    rows.forEach((row) => {
      const type = row.requirement_type;
      const existing = grouped.get(type) || [];
      existing.push({
        code: row.course_code,
        name: row.name,
        credits: row.credits,
        department: row.department,
        offered_semesters: row.offered_semesters,
        course_type: row.course_type,
        requirement_type: row.requirement_type,
      });
      grouped.set(type, existing);
    });

    res.json({
      major,
      core: grouped.get("core") || [],
      math_science: grouped.get("math_science") || [],
      other_eng: grouped.get("other_eng") || [],
      elective: grouped.get("elective") || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────
// GET /api/courses/major/:major/remaining
// Returns courses not yet completed by the user, filtered by their major
// Requires auth
// ─────────────────────────────────────────
router.get("/major/:major/remaining", authMiddleware, async (req, res) => {
  const major = req.params.major.toUpperCase();
  const userId = req.user.id;

  if (!["COE", "ELE", "MCE"].includes(major)) {
    return res.status(400).json({ message: "Invalid major." });
  }

  try {
    // Get all required courses for this major
    const [required] = await db.query(
      `SELECT mr.course_code, mr.requirement_type, c.*
       FROM major_requirements mr
       JOIN courses c ON mr.course_code = c.code
       WHERE mr.major = ?`,
      [major]
    );

    // Get completed courses for this user
    const [completed] = await db.query(
      "SELECT course_code FROM completed_courses WHERE user_id = ?",
      [userId]
    );

    // Load completed into HashSet for O(1) lookup
    const completedSet = new HashSet();
    completed.forEach((r) => completedSet.add(r.course_code));

    // Filter out completed
    const remaining = required.filter((c) => !completedSet.has(c.course_code));

    res.json(remaining);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ─────────────────────────────────────────
// GET /api/courses/major/:major/progress
// Returns credit progress summary for the user
// Requires auth
// ─────────────────────────────────────────
router.get("/major/:major/progress", authMiddleware, async (req, res) => {
  const major = req.params.major.toUpperCase();
  const userId = req.user.id;

  if (!["COE", "ELE", "MCE"].includes(major)) {
    return res.status(400).json({ message: "Invalid major." });
  }

  try {
    const [required] = await db.query(
      `SELECT mr.course_code, mr.requirement_type, c.credits
       FROM major_requirements mr
       JOIN courses c ON mr.course_code = c.code
       WHERE mr.major = ?`,
      [major]
    );

    const [completed] = await db.query(
      "SELECT course_code FROM completed_courses WHERE user_id = ?",
      [userId]
    );

    const completedSet = new HashSet();
    completed.forEach((r) => completedSet.add(r.course_code));

    // Use HashMap to accumulate credits per category
    const totalMap = new HashMap();
    const doneMap = new HashMap();

    required.forEach((c) => {
      const type = c.requirement_type;
      totalMap.set(type, (totalMap.get(type) || 0) + c.credits);
      if (completedSet.has(c.course_code)) {
        doneMap.set(type, (doneMap.get(type) || 0) + c.credits);
      }
    });

    const totalCredits = required.reduce((sum, c) => sum + c.credits, 0);
    const completedCredits = required
      .filter((c) => completedSet.has(c.course_code))
      .reduce((sum, c) => sum + c.credits, 0);

    res.json({
      major,
      totalCredits,
      completedCredits,
      remainingCredits: totalCredits - completedCredits,
      percentComplete: Math.round((completedCredits / totalCredits) * 100),
      byCategory: {
        core: {
          total: totalMap.get("core") || 0,
          completed: doneMap.get("core") || 0,
        },
        math_science: {
          total: totalMap.get("math_science") || 0,
          completed: doneMap.get("math_science") || 0,
        },
        other_eng: {
          total: totalMap.get("other_eng") || 0,
          completed: doneMap.get("other_eng") || 0,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────
// GET /api/courses/:code
// Single course by code e.g. COE312
// ─────────────────────────────────────────
router.get("/:code", (req, res) => {
  const course = catalogMap.get(req.params.code.toUpperCase());
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json(course);
});

// ─────────────────────────────────────────
// GET /api/courses/:code/prerequisites
// Returns prerequisite courses for a given course
// ─────────────────────────────────────────
router.get("/:code/prerequisites", async (req, res) => {
  const code = req.params.code.toUpperCase();
  try {
    const [rows] = await db.query(
      "SELECT prereq_code FROM prerequisites WHERE course_code = ?",
      [code]
    );
    const prereqs = rows
      .map((r) => catalogMap.get(r.prereq_code))
      .filter(Boolean);
    res.json(prereqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────
// GET /api/courses/:code/dependents
// Returns courses that require this course as a prereq
// Useful for warning when a user removes a completed course
// ─────────────────────────────────────────
router.get("/:code/dependents", async (req, res) => {
  const code = req.params.code.toUpperCase();
  try {
    const [rows] = await db.query(
      "SELECT course_code FROM prerequisites WHERE prereq_code = ?",
      [code]
    );
    const dependents = rows
      .map((r) => catalogMap.get(r.course_code))
      .filter(Boolean);
    res.json(dependents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────
// POST /api/courses/completed
// Mark a course as completed
// Requires auth
// ─────────────────────────────────────────
router.post("/completed", authMiddleware, async (req, res) => {
  const { courseCode } = req.body;
  const userId = req.user.id;

  if (!courseCode) {
    return res.status(400).json({ message: "courseCode is required" });
  }

  try {
    await db.query(
      "INSERT IGNORE INTO completed_courses (user_id, course_code) VALUES (?, ?)",
      [userId, courseCode.toUpperCase()]
    );
    res.json({ message: "Course marked as completed", courseCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────
// DELETE /api/courses/completed/:code
// Unmark a course as completed
// Requires auth
// ─────────────────────────────────────────
router.delete("/completed/:code", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const courseCode = req.params.code.toUpperCase();

  try {
    await db.query(
      "DELETE FROM completed_courses WHERE user_id = ? AND course_code = ?",
      [userId, courseCode]
    );
    res.json({ message: "Course unmarked", courseCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────
// GET /api/courses/completed/all
// Get all completed course codes for the logged-in user
// Requires auth
// ─────────────────────────────────────────
router.get("/completed/all", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      "SELECT course_code FROM completed_courses WHERE user_id = ?",
      [userId]
    );

    const completedSet = new HashSet();
    rows.forEach((r) => completedSet.add(r.course_code));

    res.json(completedSet.getAll());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
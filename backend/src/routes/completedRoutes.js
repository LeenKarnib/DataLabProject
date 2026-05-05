const express = require("express");
const router = express.Router();

const {
  loadCompletedSet,
  addCompletedCourse,
  removeCompletedCourse,
  getCompletedCourses
} = require("../services/completedService");

const auth = require("../middleware/auth");


// ✅ GET completed courses
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await getCompletedCourses(userId);

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ ADD course
router.post("/add", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseCode } = req.body;

    await addCompletedCourse(userId, courseCode);

    res.json({ message: "Course added" });
  } catch (err) {
    res.status(400).json({
      error: "Course already exists or invalid"
    });
  }
});


// ✅ REMOVE course
router.post("/remove", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseCode } = req.body;

    await removeCompletedCourse(userId, courseCode);

    res.json({ message: "Course removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ HashSet endpoint (VERY IMPORTANT for your DS proof)
router.get("/set", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const set = await loadCompletedSet(userId);

    res.json({
      completedCourses: set.getAll()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const db = require("../db"); // this is your mysql pool
const HashSet = require("../datastructures/HashSet");

// ✅ Load completed courses into HashSet
async function loadCompletedSet(userId) {
  const [rows] = await db.query(
    "SELECT course_code FROM completed_courses WHERE user_id = ?",
    [userId]
  );

  const set = new HashSet();

  rows.forEach(row => {
    set.add(row.course_code);
  });

  return set;
}


// ✅ Add course
async function addCompletedCourse(userId, courseCode) {
  await db.query(
    "INSERT INTO completed_courses (user_id, course_code) VALUES (?, ?)",
    [userId, courseCode]
  );
}


// ✅ Remove course
async function removeCompletedCourse(userId, courseCode) {
  await db.query(
    "DELETE FROM completed_courses WHERE user_id = ? AND course_code = ?",
    [userId, courseCode]
  );
}


// ✅ Get all completed courses
async function getCompletedCourses(userId) {
  const [rows] = await db.query(
    "SELECT course_code FROM completed_courses WHERE user_id = ?",
    [userId]
  );

  return rows;
}

module.exports = {
  loadCompletedSet,
  addCompletedCourse,
  removeCompletedCourse,
  getCompletedCourses
};
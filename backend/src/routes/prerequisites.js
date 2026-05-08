//It checks if the student can take a course.

const express = require("express");
const router = express.Router();

const db = require('../../db');
const Graph = require("../datastructures/Graph");
const checkPrerequisitesDFS = require("../algorithms/dfs");

router.post("/check", async (req, res) => {
    try {
        const { userId, courseCode } = req.body;

        if (!userId || !courseCode) {
            return res.status(400).json({
                message: "userId and courseCode are required"
            });
        }

        // 1. Get all prerequisite relations from database
        const [prereqRows] = await db.query(
            "SELECT course_code, prereq_code FROM prerequisites"
        );

        // 2. Build prerequisite graph
        const graph = new Graph();

        for (const row of prereqRows) {
            graph.addPrerequisite(row.course_code, row.prereq_code);
        }

        // 3. Get completed courses for this user
        const [completedRows] = await db.query(
            "SELECT course_code FROM completed_courses WHERE user_id = ?",
            [userId]
        );

        const completedCourses = completedRows.map(row => row.course_code);

        // 4. Run DFS checker
        const result = checkPrerequisitesDFS(courseCode, graph, completedCourses);

        return res.json(result);

    } catch (error) {
        console.error("Prerequisite check error:", error);

        return res.status(500).json({
            message: "Server error while checking prerequisites"
        });
    }
});

router.get("/graph", async (req, res) => {
    try {
        const [prereqRows] = await db.query(
            "SELECT course_code, prereq_code FROM prerequisites"
        );

        const graph = new Graph();

        for (const row of prereqRows) {
            graph.addPrerequisite(row.course_code, row.prereq_code);
        }

        return res.json(graph.getGraphAsObject());

    } catch (error) {
        console.error("Graph error:", error);

        return res.status(500).json({
            message: "Server error while loading prerequisite graph"
        });
    }
});

module.exports = router;
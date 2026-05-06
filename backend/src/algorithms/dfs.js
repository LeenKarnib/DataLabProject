function checkPrerequisitesDFS(courseCode, graph, completedCourses) {
    // Same idea as HashSet in Java
    const completedSet = completedCourses instanceof Set
        ? completedCourses
        : new Set(completedCourses);

    const missingSet = new Set();
    const visited = new Set();

    function dfs(currentCourse) {
        if (visited.has(currentCourse)) {
            return;
        }

        visited.add(currentCourse);

        const prerequisites = graph.getPrerequisites(currentCourse);

        for (const prereq of prerequisites) {
            if (!completedSet.has(prereq)) {
                missingSet.add(prereq);
            }

            // Continue DFS to check indirect prerequisites too
            dfs(prereq);
        }
    }

    dfs(courseCode);

    return {
        courseCode,
        allowed: missingSet.size === 0,
        missingPrerequisites: Array.from(missingSet),
        checkedCourses: Array.from(visited)
    };
}

module.exports = checkPrerequisitesDFS;
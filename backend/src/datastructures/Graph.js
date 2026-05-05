//This course creates the prerequisite graph 

class Graph {
    constructor() {
        // Same idea as HashMap<String, ArrayList<String>> in Java
        // courseCode -> list of prerequisite course codes
        this.adjList = new Map();
    }

    addCourse(courseCode) {
        if (!this.adjList.has(courseCode)) {
            this.adjList.set(courseCode, []);
        }
    }

    addPrerequisite(courseCode, prereqCode) {
        // courseCode requires prereqCode
        this.addCourse(courseCode);
        this.addCourse(prereqCode);

        this.adjList.get(courseCode).push(prereqCode);
    }

    getPrerequisites(courseCode) {
        return this.adjList.get(courseCode) || [];
    }

    getAllCourses() {
        return Array.from(this.adjList.keys());
    }

    getGraphAsObject() {
        const result = {};

        for (const [course, prereqs] of this.adjList.entries()) {
            result[course] = prereqs;
        }

        return result;
    }
}

module.exports = Graph;

class Graph {
  constructor() {
    // course--> Set of prerequisites
    this.prereqMap = new Map();

    //prerequisite -> Set of courses that depend on it
    this.dependentMap = new Map();
  }

  addCourse(courseCode) {
    if (!this.prereqMap.has(courseCode)) {
      this.prereqMap.set(courseCode, new Set());
    }

    if (!this.dependentMap.has(courseCode)) {
      this.dependentMap.set(courseCode, new Set());
    }
  }

  //CourseCode requires prereqCode
  addPrerequisite(courseCode, prereqCode) {
    this.addCourse(courseCode);
    this.addCourse(prereqCode);

    this.prereqMap.get(courseCode).add(prereqCode);
    this.dependentMap.get(prereqCode).add(courseCode);
  }

  //Same meaning as addPrerequisite, but useful if other teammates call addEdge
  addEdge(prereqCode, courseCode) {
    this.addPrerequisite(courseCode, prereqCode);
  }

  // For your older/ simple DFS code
  getPrerequisites(courseCode) {
    return Array.from(this.prereqMap.get(courseCode) || []);
  }

  // For the newer DFS code
  getPrereqs(courseCode) {
    return this.prereqMap.get(courseCode) || new Set();
  }

  getDependents(courseCode) {
    return this.dependentMap.get(courseCode) || new Set();
  }

  getAllCourses() {
    return Array.from(this.prereqMap.keys());
  }

  hasNode(courseCode) {
    return this.prereqMap.has(courseCode);
  }

  // Returns course-> prerequisites
  getGraphAsObject() {
    const result = {};

    for (const [course, prereqs] of this.prereqMap.entries()) {
      result[course] = Array.from(prereqs);
    }

    return result;
  }

  // Returns nodes +edges for visualization/BFS
  serialize() {
    const nodes = this.getAllCourses();
    const edges = [];

    for (const [course, prereqs] of this.prereqMap.entries()) {
      for (const prereq of prereqs) {
        edges.push({
          from: prereq,
          to: course,
        });
      }
    }

    return { nodes, edges };
  }

  static buildFromDB(prereqRows, courseRows = []) {
    const graph = new Graph();

    for (const course of courseRows) {
      graph.addCourse(course.code);
    }

    for (const row of prereqRows) {
      graph.addPrerequisite(row.course_code, row.prereq_code);
    }

    return graph;
  }
}

module.exports = Graph;
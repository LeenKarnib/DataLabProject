function detectCycles(graph) {
  const visited = new Set();      // BLACK nodes — fully explored
  const currentPath = new Set();  // GRAY nodes — current DFS path
  const pathStack = [];           // actual ordered path for cycle extraction
  const cycles = [];

  function dfs(courseCode) {
    if (currentPath.has(courseCode)) {
      // Found a cycle — extract the loop
      const cycleStart = pathStack.indexOf(courseCode);
      const cycle = pathStack.slice(cycleStart);
      cycle.push(courseCode); // close the loop visually
      cycles.push(cycle);
      return;
    }

    if (visited.has(courseCode)) {
      //already fully explored this node ->no cycle from here
      return;
    }

    //Mark as gray (in current path)
    currentPath.add(courseCode);
    pathStack.push(courseCode);

    //explore all courses that REQUIRE this course (forward edges)
    const dependents = graph.getDependents(courseCode);
    for (const dep of dependents) {
      dfs(dep);
    }

    //Mark as BLACK (done)
    currentPath.delete(courseCode);
    pathStack.pop();
    visited.add(courseCode);
  }

  // Run DFS from every node to catch disconnected components
  for (const course of graph.getAllCourses()) {
    if (!visited.has(course)) {
      dfs(course);
    }
  }

  return {
    hasCycle: cycles.length > 0,
    cycles,
  };
}


function wouldCreateCycle(graph, prereq, course) {
  // If we can already reach `prereq` from 'course' via existing edges,
  //then adding prereq → course creates a cycle.
  const visited = new Set();
  const path = [];

  function dfs(current, target) {
    if (current === target) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    path.push(current);

    for (const dep of graph.getDependents(current)) {
      if (dfs(dep, target)) return true;
    }

    path.pop();
    return false;
  }

  // Can we reach 'prereq' starting from course?
  const wouldCycle = dfs(course, prereq);

  return {
    wouldCreateCycle: wouldCycle,
    cyclePath: wouldCycle ? [...path, prereq, course] : null,
  };
}

module.exports = { detectCycles, wouldCreateCycle };
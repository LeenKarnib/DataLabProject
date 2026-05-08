class BFSPlanner {
  static generatePlan(graph, completedCodes, requiredCodes, courseDetails = []) {

    const SCHEDULE = [
      { label: 'Fall 1',   type: 'normal',         season: 'fall',   min: 15, max: 18 }, // 0
      { label: 'Spring 1', type: 'normal',         season: 'spring', min: 15, max: 18 }, // 1
      { label: 'Summer 1', type: 'summer_limited', season: 'summer', min: 0,  max: 9  }, // 2
      { label: 'Fall 2',   type: 'normal',         season: 'fall',   min: 15, max: 18 }, // 3
      { label: 'Spring 2', type: 'normal',         season: 'spring', min: 15, max: 18 }, // 4
      { label: 'Summer 2', type: 'summer_limited', season: 'summer', min: 0,  max: 9  }, // 5
      { label: 'Fall 3',   type: 'normal',         season: 'fall',   min: 15, max: 18 }, // 6
      { label: 'Spring 3', type: 'normal',         season: 'spring', min: 15, max: 18 }, // 7
      { label: 'Summer 3', type: 'summer_pe',      season: 'summer', min: 6,  max: 6  }, // 8
      { label: 'Fall 4',   type: 'normal',         season: 'fall',   min: 15, max: 18 }, // 9
      { label: 'Spring 4', type: 'normal',         season: 'spring', min: 15, max: 18 }, // 10
      { label: 'Fall 5',   type: 'normal',         season: 'fall',   min: 15, max: 18 }, // 11
      { label: 'Spring 5', type: 'normal',         season: 'spring', min: 15, max: 18 }, // 12
      { label: 'Fall 6',   type: 'normal',         season: 'fall',   min: 0,  max: 18 }, // 13 overflow
      { label: 'Spring 6', type: 'normal',         season: 'spring', min: 0,  max: 18 }, // 14 overflow
    ];

    
    const STANDING_TO_INDEX = { 1: 0, 2: 3, 3: 6, 4: 9, 5: 11 };
    const PE_STANDING_INDEX = 8; 

    
    const courseMap = {};
    for (const c of courseDetails) {
      courseMap[c.code] = c;
    }

    function getCourse(code) {
      return courseMap[code] || { code, name: code, credits: 3, year_standing: 1, offered_semesters: 'both' };
    }

    
    const completed = new Set(completedCodes);
    const remaining = requiredCodes.filter(c => !completed.has(c));
    const remainingSet = new Set(remaining);

    // ── Compute in-degree (unmet prereqs within remaining set)
    const inDegree = {};
    for (const code of remaining) inDegree[code] = 0;
    for (const code of remaining) {
      for (const prereq of graph.getPrereqs(code)) {
        if (remainingSet.has(prereq)) inDegree[code]++;
      }
    }



    // Earliest schedule index this course can appear in
    function earliestSlot(code) {
      const c = getCourse(code);
      const standing = c.year_standing || 1;
      const offered = c.offered_semesters || 'both';
      // PE / summer-only courses with year 5 standing go to Summer 3
      if (offered === 'summer' && standing >= 5) return PE_STANDING_INDEX;
      return STANDING_TO_INDEX[standing] ?? 0;
    }

    function canPlace(code, slotIdx) {
      const slot = SCHEDULE[slotIdx];
      const c = getCourse(code);
      const offered = c.offered_semesters || 'both';

      if (earliestSlot(code) > slotIdx) return false; // year standing not met

      switch (slot.type) {
        case 'summer_pe':
          // Only summer-only courses (i.e. Professional Experience)
          return offered === 'summer';

        case 'summer_limited':
          // No fall-only or spring-only courses in summer
          return offered === 'both' || offered === 'summer';

        case 'normal':
  
          if (offered === 'summer') return false;
          // Respect fall/spring restrictions
          if (offered === 'fall')   return slot.season === 'fall';
          if (offered === 'spring') return slot.season === 'spring';
          return true; // 'both'

        default:
          return false;
      }
    }

    // BFS setup 
    const placed = new Set();
    const semesters = [];

    // Pool: all courses whose prereqs are satisfied (inDegree === 0)
    let pool = new Set(remaining.filter(c => inDegree[c] === 0));

    // After placing a batch, unlock their dependents
    function unlock(codes) {
      for (const code of codes) {
        for (const dep of graph.getDependents(code)) {
          if (!remainingSet.has(dep) || placed.has(dep)) continue;
          inDegree[dep]--;
          if (inDegree[dep] === 0) pool.add(dep);
        }
      }
    }

    // fill each slot 
    for (let slotIdx = 0; slotIdx < SCHEDULE.length; slotIdx++) {
      const slot = SCHEDULE[slotIdx];

      // Stop early if everything placed
      if (placed.size >= remaining.length) break;

      // Get all pool courses eligible for this slot
      let eligible = [...pool].filter(code => canPlace(code, slotIdx));

      if (eligible.length === 0) continue; // nothing fits this slot, move on

      // Sort: lightest first for better credit packing
      eligible.sort((a, b) => (getCourse(a).credits || 3) - (getCourse(b).credits || 3));

      // Fill this semester up to max credits 
      const semCourses = [];
      let semCredits = 0;

      for (const code of eligible) {
        const credits = getCourse(code).credits || 3;
        if (semCredits + credits > slot.max) continue;
        semCourses.push(getCourse(code));
        semCredits += credits;
        placed.add(code);
        pool.delete(code);
      }

      if (semCourses.length === 0) continue;

      // Unlock dependents immediately so they can be pulled into this semester
      unlock(semCourses.map(c => c.code));

      if (slot.type === 'normal' && semCredits < slot.min) {
        // Keep pulling newly unlocked courses until we hit min or nothing left fits
        let keepGoing = true;
        while (keepGoing && semCredits < slot.min) {
          keepGoing = false;

          const extra = [...pool]
            .filter(code => canPlace(code, slotIdx))
            .sort((a, b) => (getCourse(a).credits || 3) - (getCourse(b).credits || 3));

          for (const code of extra) {
            const credits = getCourse(code).credits || 3;
            if (semCredits + credits <= slot.max) {
              const course = getCourse(code);
              semCourses.push(course);
              semCredits += credits;
              placed.add(code);
              pool.delete(code);
              keepGoing = true; 
            }
          }

          if (keepGoing) unlock(semCourses.map(c => c.code));
        }
      }

      semesters.push({
        label:        slot.label,
        semesterNumber: semesters.length + 1,
        courses:      semCourses,
        totalCredits: semCredits,
        courseCount:  semCourses.length,
      });
    }

    const unplaced = remaining.filter(c => !placed.has(c));
    if (unplaced.length > 0) {
      console.warn('[BFSPlanner] Could not place:', unplaced);
    }

    return { semesters, unplaced };
  }

  static getSemesterSummaries(semesters) {
    return semesters;
  }
}

module.exports = BFSPlanner;
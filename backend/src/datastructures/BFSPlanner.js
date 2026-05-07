// backend/src/datastructures/BFSPlanner.js

class BFSPlanner {
  /**
   * Generates a realistic semester-by-semester degree plan using BFS.
   *
   * Rules:
   *  - Follows a fixed semester schedule: Fall → Spring → Summer (repeating)
   *  - Normal semesters (Fall/Spring): 15–18 credits
   *  - Summer 1 & 2: up to 9 credits, only courses offered in 'both' or 'summer'
   *  - Summer 3: Professional Experience only (offered_semesters = 'summer')
   *  - Fall-only courses never placed in Spring, and vice versa
   *  - Year standing gates courses to the correct year
   *
   * Schedule index map:
   *  0  = Fall 1      6  = Fall 3       11 = Fall 5
   *  1  = Spring 1    7  = Spring 3     12 = Spring 5
   *  2  = Summer 1    8  = Summer 3 (PE)
   *  3  = Fall 2      9  = Fall 4
   *  4  = Spring 2    10 = Spring 4
   *  5  = Summer 2
   *
   * Year standing → earliest slot index:
   *  1 → 0 (Fall 1)
   *  2 → 3 (Fall 2)
   *  3 → 6 (Fall 3)
   *  4 → 9 (Fall 4)
   *  5 → 8 (Summer 3 — for PE) / 11 (Fall 5 — for everything else)
   */
  static generatePlan(graph, completedCodes, requiredCodes, courseDetails = []) {

    // ── Semester schedule ──────────────────────────────────────────────────
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

    // Year standing → earliest schedule index
    // PE courses (summer only) use index 8, everything else uses the fall of that year
    const STANDING_TO_INDEX = { 1: 0, 2: 3, 3: 6, 4: 9, 5: 11 };
    const PE_STANDING_INDEX = 8; // Summer 3 — for summer-only courses with year_standing 5

    // ── Build course lookup ────────────────────────────────────────────────
    const courseMap = {};
    for (const c of courseDetails) {
      courseMap[c.code] = c;
    }

    function getCourse(code) {
      return courseMap[code] || { code, name: code, credits: 3, year_standing: 1, offered_semesters: 'both' };
    }

    // ── Filter to only unfinished courses ─────────────────────────────────
    const completed = new Set(completedCodes);
    const remaining = requiredCodes.filter(c => !completed.has(c));
    const remainingSet = new Set(remaining);

    // ── Compute in-degree (unmet prereqs within remaining set) ────────────
    const inDegree = {};
    for (const code of remaining) inDegree[code] = 0;
    for (const code of remaining) {
      for (const prereq of graph.getPrereqs(code)) {
        if (remainingSet.has(prereq)) inDegree[code]++;
      }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    // Earliest schedule index this course can appear in
    function earliestSlot(code) {
      const c = getCourse(code);
      const standing = c.year_standing || 1;
      const offered = c.offered_semesters || 'both';
      // PE / summer-only courses with year 5 standing go to Summer 3
      if (offered === 'summer' && standing >= 5) return PE_STANDING_INDEX;
      return STANDING_TO_INDEX[standing] ?? 0;
    }

    // Can this course be placed in this schedule slot?
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
          // Never place summer-only courses in normal semesters
          if (offered === 'summer') return false;
          // Respect fall/spring restrictions
          if (offered === 'fall')   return slot.season === 'fall';
          if (offered === 'spring') return slot.season === 'spring';
          return true; // 'both'

        default:
          return false;
      }
    }

    // ── BFS setup ─────────────────────────────────────────────────────────
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

    // ── Main loop: fill each slot ──────────────────────────────────────────
    for (let slotIdx = 0; slotIdx < SCHEDULE.length; slotIdx++) {
      const slot = SCHEDULE[slotIdx];

      // Stop early if everything placed
      if (placed.size >= remaining.length) break;

      // Get all pool courses eligible for this slot
      let eligible = [...pool].filter(code => canPlace(code, slotIdx));

      if (eligible.length === 0) continue; // nothing fits this slot, move on

      // Sort: lightest first for better credit packing
      eligible.sort((a, b) => (getCourse(a).credits || 3) - (getCourse(b).credits || 3));

      // ── Fill this semester up to max credits ───────────────────────────
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

      // ── Top up to minimum if this is a normal semester ─────────────────
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
              keepGoing = true; // something was added, try another round
            }
          }

          if (keepGoing) unlock(semCourses.map(c => c.code));
        }
      }

      // ── Record semester ────────────────────────────────────────────────
      semesters.push({
        label:        slot.label,
        semesterNumber: semesters.length + 1,
        courses:      semCourses,
        totalCredits: semCredits,
        courseCount:  semCourses.length,
      });
    }

    // ── Report anything that couldn't be placed ────────────────────────────
    const unplaced = remaining.filter(c => !placed.has(c));
    if (unplaced.length > 0) {
      console.warn('[BFSPlanner] Could not place:', unplaced);
    }

    return { semesters, unplaced };
  }

  // Kept for route compatibility — semesters are already enriched
  static getSemesterSummaries(semesters) {
    return semesters;
  }
}

module.exports = BFSPlanner;
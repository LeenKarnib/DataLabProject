// client/src/utils/validateDrop.js
// Pure client-side validation for drag-and-drop course placement.
// Returns { valid: bool, reasons: string[] }
//
// Checks (in order):
//  1. offered_semesters vs target season
//  2. year_standing vs target semester
//  3. All prerequisites placed in an EARLIER semester
//  4. Credit cap (max 18 for normal, 9 for summer limited, 6 for summer_pe)

const SCHEDULE = [
  { label: "Fall 1",   season: "fall",   type: "normal",         max: 18 },
  { label: "Spring 1", season: "spring", type: "normal",         max: 18 },
  { label: "Summer 1", season: "summer", type: "summer_limited", max: 9  },
  { label: "Fall 2",   season: "fall",   type: "normal",         max: 18 },
  { label: "Spring 2", season: "spring", type: "normal",         max: 18 },
  { label: "Summer 2", season: "summer", type: "summer_limited", max: 9  },
  { label: "Fall 3",   season: "fall",   type: "normal",         max: 18 },
  { label: "Spring 3", season: "spring", type: "normal",         max: 18 },
  { label: "Summer 3", season: "summer", type: "summer_pe",      max: 6  },
  { label: "Fall 4",   season: "fall",   type: "normal",         max: 18 },
  { label: "Spring 4", season: "spring", type: "normal",         max: 18 },
  { label: "Fall 5",   season: "fall",   type: "normal",         max: 18 },
  { label: "Spring 5", season: "spring", type: "normal",         max: 18 },
];

const LABEL_TO_INDEX = Object.fromEntries(SCHEDULE.map((s, i) => [s.label, i]));

// Year standing → earliest semester index
const STANDING_TO_INDEX = { 1: 0, 2: 3, 3: 6, 4: 9, 5: 11 };
// PE courses (summer-only + year 5) → Summer 3 (index 8)
const PE_INDEX = 8;

/**
 * @param {object} course         — the course being dropped
 * @param {string} targetLabel    — e.g. "Fall 2"
 * @param {object} semesters      — { [label]: course[] } current plan state
 * @param {object} prereqMap      — { [courseCode]: string[] } all prereq edges
 */
export function validateDrop(course, targetLabel, semesters, prereqMap) {
  const reasons = [];
  const slot = SCHEDULE.find((s) => s.label === targetLabel);
  if (!slot) return { valid: false, reasons: ["Unknown semester."] };

  const targetIdx = LABEL_TO_INDEX[targetLabel];
  const offered = course.offered_semesters || "both";

  // ── 1. Offered semester check ─────────────────────────────────────────────
  if (slot.type === "summer_pe") {
    if (offered !== "summer") {
      reasons.push(
        `${course.code} is not a summer course. Summer 3 is reserved for Professional Experience only.`
      );
    }
  } else if (slot.type === "summer_limited") {
    if (offered === "fall") {
      reasons.push(`${course.code} is only offered in Fall semesters, not Summer.`);
    } else if (offered === "spring") {
      reasons.push(`${course.code} is only offered in Spring semesters, not Summer.`);
    } else if (offered === "summer") {
      // PE course in a non-PE summer — warn but allow
    }
  } else {
    // Normal semester
    if (offered === "summer") {
      reasons.push(`${course.code} is a summer-only course and cannot be placed in ${targetLabel}.`);
    } else if (offered === "fall" && slot.season !== "fall") {
      reasons.push(`${course.code} is only offered in Fall semesters, not ${slot.label}.`);
    } else if (offered === "spring" && slot.season !== "spring") {
      reasons.push(`${course.code} is only offered in Spring semesters, not ${slot.label}.`);
    }
  }

  // ── 2. Year standing check ────────────────────────────────────────────────
  const standing = course.year_standing || 1;
  let earliestIdx = STANDING_TO_INDEX[standing] ?? 0;
  if (offered === "summer" && standing >= 5) earliestIdx = PE_INDEX;

  if (targetIdx < earliestIdx) {
    const earliestLabel = SCHEDULE[earliestIdx]?.label || `Year ${standing}`;
    reasons.push(
      `${course.code} requires Year ${standing} standing. Earliest it can be taken is ${earliestLabel}.`
    );
  }

  // ── 3. Prerequisite check ─────────────────────────────────────────────────
  const prereqs = prereqMap[course.code] || [];
  const missingPrereqs = [];
  const sameOrLaterPrereqs = [];

  // Build a map of where each prereq is placed
  const placementMap = {}; // courseCode → semesterIndex
  for (const [label, courses] of Object.entries(semesters)) {
    const idx = LABEL_TO_INDEX[label];
    if (idx === undefined) continue;
    for (const c of courses) {
      placementMap[c.code] = idx;
    }
  }

  for (const prereqCode of prereqs) {
    if (prereqCode === course.code) continue; // skip self-loops if any
    const placedIdx = placementMap[prereqCode];
    if (placedIdx === undefined) {
      missingPrereqs.push(prereqCode);
    } else if (placedIdx >= targetIdx) {
      sameOrLaterPrereqs.push({ code: prereqCode, label: SCHEDULE[placedIdx]?.label });
    }
  }

  if (missingPrereqs.length > 0) {
    reasons.push(
      `Missing prerequisites not yet scheduled: ${missingPrereqs.join(", ")}. Place them in an earlier semester first.`
    );
  }

  if (sameOrLaterPrereqs.length > 0) {
    const details = sameOrLaterPrereqs
      .map((p) => `${p.code} (in ${p.label})`)
      .join(", ");
    reasons.push(
      `The following prerequisites must be in an earlier semester: ${details}.`
    );
  }

  // ── 4. Credit cap check ───────────────────────────────────────────────────
  const currentCourses = (semesters[targetLabel] || []).filter(
    (c) => c.code !== course.code // exclude if already there (moving within semester)
  );
  const currentCredits = currentCourses.reduce((sum, c) => sum + (c.credits || 3), 0);
  const addedCredits = course.credits || 3;

  if (currentCredits + addedCredits > slot.max) {
    reasons.push(
      `${targetLabel} would reach ${currentCredits + addedCredits} credits, exceeding the ${slot.max}-credit maximum.`
    );
  }

  return { valid: reasons.length === 0, reasons };
}

export { SCHEDULE, LABEL_TO_INDEX };
// client/src/api/customPlanner.js

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Load saved plan + unscheduled pool
export async function fetchCustomPlan(major) {
  const res = await fetch(`${API}/api/planner/${major}/custom`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load custom plan");
  return res.json();
  // Returns { semesters: {label: course[]}, unscheduled: course[], prereqMap, schedule }
}

// Save full plan state
// assignments: [{ course_code, semester_label }]  (unscheduled courses omitted)
export async function saveCustomPlan(major, assignments) {
  const res = await fetch(`${API}/api/planner/${major}/custom`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ assignments }),
  });
  if (!res.ok) throw new Error("Failed to save plan");
  return res.json();
}

// Reset entire plan for this major
export async function resetCustomPlan(major) {
  const res = await fetch(`${API}/api/planner/${major}/custom`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to reset plan");
  return res.json();
}
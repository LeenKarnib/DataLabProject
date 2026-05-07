// client/src/api/planner.js

import { getToken } from "../utils/token";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Fetch the BFS semester plan for the given major.
 * Requires a valid JWT in localStorage.
 */
export async function getPlan(major) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/planner/${major}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch plan");
  }

  return res.json();
}
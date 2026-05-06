// client/src/hooks/usePlanner.js

import { useState, useEffect, useCallback } from "react";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export function usePlanner() {
  const [semesters, setSemesters] = useState([]);
  const [totalSemesters, setTotalSemesters] = useState(0);
  const [totalCreditsRemaining, setTotalCreditsRemaining] = useState(0);
  const [unplaced, setUnplaced] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlan = useCallback(async () => {
    const token = localStorage.getItem("token");
    const major = localStorage.getItem("major");

    if (!token || !major) {
      setError("Not logged in or major missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/planner/${major}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch plan");
      }

      const data = await res.json();
      setSemesters(data.semesters);
      setTotalSemesters(data.totalSemesters);
      setTotalCreditsRemaining(data.totalCreditsRemaining);
      setUnplaced(data.unplaced || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { semesters, totalSemesters, totalCreditsRemaining, unplaced, loading, error, refetch: fetchPlan };
}
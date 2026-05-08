import React, { useState, useEffect, useMemo } from "react";
import PrereqGraph from "../components/PrereqGraph";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchGraph(major) {
  const res = await fetch(`${API}/api/courses/major/${major}/graph`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load prerequisite graph");
  return res.json(); 
}

async function fetchCompleted() {
  const res = await fetch(`${API}/api/courses/completed/all`, {
    headers: authHeaders(),
  });
  if (!res.ok) return []; 
  return res.json(); 
}

const DEPTS = ["ALL", "COE", "ELE", "MCE", "MTH", "PHY", "GNE", "INE", "ENG"];
const YEARS = ["ALL", "1", "2", "3", "4", "5"];
const REQ_TYPES = ["ALL", "core", "math_science", "other_eng", "elective", "las"];

// GraphPage 
export default function GraphPage() {
  const major = localStorage.getItem("major") || "COE";

  const [graphData, setGraphData] = useState(null); // { courses, edges }
  const [completedSet, setCompletedSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [reqFilter, setReqFilter] = useState("ALL");
  const [hideCompleted, setHideCompleted] = useState(false);

  // Load data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [graph, completed] = await Promise.all([
          fetchGraph(major),
          fetchCompleted(),
        ]);
        if (!cancelled) {
          setGraphData(graph);
          setCompletedSet(new Set(completed));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [major]);

  // Derive filtered courses + edges
  const { filteredCourses, filteredEdges } = useMemo(() => {
    if (!graphData) return { filteredCourses: [], filteredEdges: [] };

    const q = search.trim().toUpperCase();

    const filteredCourses = graphData.courses.filter((c) => {
      if (q && !c.code.includes(q) && !c.name.toUpperCase().includes(q)) return false;
      if (deptFilter !== "ALL" && !c.department?.toUpperCase().startsWith(deptFilter)) return false;
      if (yearFilter !== "ALL" && String(c.year_standing) !== yearFilter) return false;
      if (reqFilter !== "ALL" && c.requirement_type !== reqFilter) return false;
      if (hideCompleted && completedSet.has(c.code)) return false;
      return true;
    });

    const visibleCodes = new Set(filteredCourses.map((c) => c.code));

    // Keep edges where both endpoints are visible
    const filteredEdges = graphData.edges.filter(
      (e) => visibleCodes.has(e.source) && visibleCodes.has(e.target)
    );

    return { filteredCourses, filteredEdges };
  }, [graphData, search, deptFilter, yearFilter, reqFilter, hideCompleted, completedSet]);

  // Stats
  const stats = useMemo(() => {
    if (!graphData) return {};
    return {
      total: graphData.courses.length,
      visible: filteredCourses.length,
      edges: filteredEdges.length,
      completed: graphData.courses.filter((c) => completedSet.has(c.code)).length,
    };
  }, [graphData, filteredCourses, filteredEdges, completedSet]);

  
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 56px)", 
        background: "#0a0f0d",
        color: "#ccc",
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          background: "#0d1410",
          borderBottom: "1px solid #1a3028",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        {/* Title */}
        <div style={{ marginRight: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              color: "#4ade80",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            DegreeMap — {major}
          </span>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
              fontFamily: "sans-serif",
            }}
          >
            Prerequisite Graph
          </div>
        </div>

        {/* Stats pills */}
        {!loading && !error && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Pill label="Courses" value={stats.visible} total={stats.total} color="#4ade80" />
            <Pill label="Edges" value={stats.edges} color="#60a5fa" />
            <Pill label="Completed" value={stats.completed} total={stats.total} color="#22c55e" />
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search course..."
          style={{
            background: "#111",
            border: "1px solid #2a4a35",
            borderRadius: "6px",
            color: "#ccc",
            padding: "6px 10px",
            fontSize: "12px",
            fontFamily: "monospace",
            outline: "none",
            width: "160px",
          }}
        />

        {/* Filter dropdowns */}
        <FilterSelect label="Dept" value={deptFilter} onChange={setDeptFilter} options={DEPTS} />
        <FilterSelect label="Year" value={yearFilter} onChange={setYearFilter} options={YEARS} />
        <FilterSelect label="Type" value={reqFilter} onChange={setReqFilter} options={REQ_TYPES} />

        {/* Hide completed toggle */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            color: "#888",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            style={{ accentColor: "#4ade80" }}
          />
          Hide completed
        </label>
      </div>

      {/* ── Graph area ── */}
      <div style={{ flex: 1, position: "relative" }}>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

        {!loading && !error && filteredCourses.length === 0 && (
          <EmptyState hasFilters={search || deptFilter !== "ALL" || yearFilter !== "ALL" || reqFilter !== "ALL"} />
        )}

        {!loading && !error && filteredCourses.length > 0 && (
          <PrereqGraph
            courses={filteredCourses}
            edges={filteredEdges}
            completedSet={completedSet}
          />
        )}
      </div>
    </div>
  );
}


function Pill({ label, value, total, color }) {
  return (
    <div
      style={{
        background: "#111",
        border: `1px solid ${color}44`,
        borderRadius: "20px",
        padding: "3px 10px",
        fontSize: "11px",
        display: "flex",
        gap: "4px",
        alignItems: "center",
      }}
    >
      <span style={{ color: "#555" }}>{label}:</span>
      <span style={{ color, fontWeight: 700 }}>{value}</span>
      {total !== undefined && (
        <span style={{ color: "#444" }}>/ {total}</span>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <span style={{ fontSize: "10px", color: "#555", whiteSpace: "nowrap" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "#111",
          border: "1px solid #2a4a35",
          borderRadius: "5px",
          color: "#ccc",
          padding: "4px 6px",
          fontSize: "11px",
          fontFamily: "monospace",
          outline: "none",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "#0a0f0d",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "2px solid #1a3028",
          borderTop: "2px solid #4ade80",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ color: "#4ade80", fontSize: "12px", letterSpacing: "0.15em" }}>
        BUILDING GRAPH...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        background: "#0a0f0d",
      }}
    >
      <div style={{ fontSize: "28px" }}>⚠</div>
      <p style={{ color: "#f87171", fontSize: "13px", fontFamily: "sans-serif" }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          background: "transparent",
          border: "1px solid #f87171",
          color: "#f87171",
          borderRadius: "6px",
          padding: "7px 16px",
          fontSize: "12px",
          cursor: "pointer",
          fontFamily: "monospace",
        }}
      >
        RETRY
      </button>
    </div>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        background: "#0a0f0d",
      }}
    >
      <p style={{ fontSize: "11px", color: "#555", letterSpacing: "0.1em" }}>
        {hasFilters ? "NO COURSES MATCH YOUR FILTERS" : "NO COURSES FOUND"}
      </p>
    </div>
  );
}
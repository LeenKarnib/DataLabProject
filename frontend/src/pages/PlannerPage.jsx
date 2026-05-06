// client/src/pages/PlannerPage.jsx

import React from "react";
import SemesterColumn from "../components/SemesterColumn";
import { usePlanner } from "../hooks/usePlanner";

export default function PlannerPage() {
  const major = localStorage.getItem("major") || "";
  const { semesters, totalSemesters, totalCreditsRemaining, loading, error, refetch } = usePlanner();

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8f9" }}>
      {/* Page Header */}
      <div
        style={{
          background: "#1a6b3c",
          color: "#fff",
          padding: "28px 32px 24px",
          borderBottom: "3px solid #145530",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "13px", opacity: 0.75, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                DegreeMap — {major}
              </p>
              <h1 style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>
                Semester Plan
              </h1>
              <p style={{ margin: "6px 0 0", fontSize: "13px", opacity: 0.8 }}>
                Auto-generated using BFS prerequisite ordering
              </p>
            </div>

            {!loading && !error && (
              <div style={{ display: "flex", gap: "20px" }}>
                <Stat label="Semesters Remaining" value={totalSemesters} />
                <Stat label="Credits Remaining" value={totalCreditsRemaining} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 32px" }}>

        {/* Regenerate button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <button
            onClick={refetch}
            disabled={loading}
            style={{
              background: loading ? "#ccc" : "#1a6b3c",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "9px 20px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{loading ? "Generating..." : "↻ Regenerate Plan"}</span>
          </button>
        </div>

        {/* States */}
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && semesters.length === 0 && (
          <EmptyState />
        )}

        {/* Planner Grid — horizontal scroll of SemesterColumns */}
        {!loading && !error && semesters.length > 0 && (
          <>
            {/* Legend */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[
                { dept: "COE", label: "Computer Eng", color: "#1a6b3c" },
                { dept: "ELE", label: "Electrical Eng", color: "#1a3a7a" },
                { dept: "MCE/MEE", label: "Mechatronics", color: "#7a3a1a" },
                { dept: "MTH/PHY", label: "Math & Science", color: "#3a1a7a" },
                { dept: "GNE/INE", label: "General Eng", color: "#6b4a1a" },
              ].map((item) => (
                <div key={item.dept} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#555" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: item.color, display: "inline-block" }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Horizontal scroll container */}
            <div
              style={{
                overflowX: "auto",
                overflowY: "visible",
                paddingBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                  minWidth: "max-content",
                  paddingBottom: "8px",
                }}
              >
                {semesters.map((sem) => (
                  <SemesterColumn
                    key={sem.semesterNumber}
                    semesterNumber={sem.semesterNumber}
                    label={sem.label}
                    courses={sem.courses}
                    totalCredits={sem.totalCredits}
                    courseCount={sem.courseCount}
                  />
                ))}
              </div>
            </div>

            {/* Note about electives */}
            <p style={{ marginTop: "20px", fontSize: "12px", color: "#888", textAlign: "center" }}>
              * Elective courses shown are examples. You can swap them with any approved technical elective for your major.
              Semester groupings are based on prerequisite levels — actual scheduling may vary.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "28px", fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: "11px", opacity: 0.75, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "4px solid #e0e0e0",
          borderTop: "4px solid #1a6b3c",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }}
      />
      <p style={{ color: "#666", fontSize: "14px" }}>Running BFS on your prerequisite graph...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div
      style={{
        background: "#fff5f5",
        border: "1px solid #f5c6cb",
        borderRadius: "10px",
        padding: "24px",
        textAlign: "center",
        color: "#721c24",
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: "12px" }}>⚠ Failed to load plan</p>
      <p style={{ fontSize: "13px", marginBottom: "16px" }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          background: "#721c24",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          padding: "8px 18px",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#666" }}>
      <p style={{ fontSize: "40px", marginBottom: "12px" }}>🎓</p>
      <p style={{ fontWeight: 700, fontSize: "18px", color: "#333" }}>You've completed all required courses!</p>
      <p style={{ fontSize: "13px" }}>No remaining courses to plan. Graduation incoming.</p>
    </div>
  );
}
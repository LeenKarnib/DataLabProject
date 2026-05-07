// client/src/components/InvalidDropModal.jsx
// Modal shown when a course is dropped in an invalid semester.
// Props: { course, targetLabel, reasons, onClose }

import React, { useEffect } from "react";

export default function InvalidDropModal({ course, targetLabel, reasons, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!course) return null;

  const dept = course.department || course.code?.match(/^[A-Z]+/)?.[0] || "";

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(3px)",
        animation: "fadeIn 0.15s ease",
      }}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "440px",
          margin: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
          overflow: "hidden",
          animation: "slideUp 0.18s ease",
          fontFamily: "'DM Sans', 'Geist', sans-serif",
        }}
      >
        {/* Red header strip */}
        <div
          style={{
            background: "linear-gradient(135deg, #c0392b, #e74c3c)",
            padding: "20px 24px 16px",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <span style={{ fontSize: "28px", lineHeight: 1 }}>⛔</span>
            <div>
              <div style={{ fontSize: "11px", opacity: 0.8, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3px" }}>
                Invalid Placement
              </div>
              <div style={{ fontSize: "17px", fontWeight: 700, lineHeight: 1.2 }}>
                Cannot place{" "}
                <span style={{ fontFamily: "monospace", background: "rgba(255,255,255,0.18)", padding: "1px 7px", borderRadius: "5px" }}>
                  {course.code}
                </span>{" "}
                in {targetLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Course info strip */}
        <div
          style={{
            background: "#fdf5f5",
            borderBottom: "1px solid #f0e0e0",
            padding: "10px 24px",
            fontSize: "12px",
            color: "#666",
            display: "flex",
            gap: "16px",
          }}
        >
          <span>{course.name}</span>
          <span style={{ color: "#bbb" }}>·</span>
          <span>{course.credits} credits</span>
          <span style={{ color: "#bbb" }}>·</span>
          <span>Year {course.year_standing}</span>
        </div>

        {/* Reasons */}
        <div style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#999", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
            Why this doesn't work
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
            {reasons.map((reason, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  background: "#fff8f8",
                  border: "1px solid #fcdede",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "#333",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: "#e74c3c", fontSize: "15px", flexShrink: 0, marginTop: "1px" }}>✕</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0 24px 20px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#1a6b3c",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "9px 22px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#145530")}
            onMouseLeave={(e) => (e.target.style.background = "#1a6b3c")}
          >
            Got it
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
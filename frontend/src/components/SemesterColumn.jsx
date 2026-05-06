// client/src/components/SemesterColumn.jsx

import React from "react";

const DEPARTMENT_COLORS = {
  COE:  { bg: "#e8f5ee", text: "#1a6b3c", border: "#a8d5b5" },
  ELE:  { bg: "#e8f0fb", text: "#1a3a7a", border: "#a8bfef" },
  MCE:  { bg: "#fef3e8", text: "#7a3a1a", border: "#efcfa8" },
  MTH:  { bg: "#f3f0fb", text: "#3a1a7a", border: "#c0a8ef" },
  PHY:  { bg: "#f0fbfb", text: "#1a5a6b", border: "#a8d5df" },
  GNE:  { bg: "#fbf3e8", text: "#6b4a1a", border: "#efd5a8" },
  INE:  { bg: "#fafbf0", text: "#4a5a1a", border: "#d5efa8" },
  MEE:  { bg: "#fbf0f3", text: "#7a1a3a", border: "#efa8bf" },
  CIE:  { bg: "#f0f3fb", text: "#1a3a6b", border: "#a8bfdf" },
  ENG:  { bg: "#fdf8f0", text: "#7a5a1a", border: "#efdfb0" },
  COM:  { bg: "#fdf8f0", text: "#7a5a1a", border: "#efdfb0" },
  LAS:  { bg: "#f8f8f8", text: "#555",    border: "#ddd"    },
  FREE: { bg: "#f8f8f8", text: "#555",    border: "#ddd"    },
  DEFAULT: { bg: "#f5f5f5", text: "#444", border: "#ccc"    },
};

function getDeptStyle(department) {
  return DEPARTMENT_COLORS[department] || DEPARTMENT_COLORS.DEFAULT;
}

function CourseTag({ course_type }) {
  if (course_type === "lab")      return <Tag label="Lab"  bg="#fff3cd" color="#856404" border="#ffc107" />;
  if (course_type === "elective") return <Tag label="Elec" bg="#d4edda" color="#155724" border="#28a745" />;
  return null;
}

function Tag({ label, bg, color, border }) {
  return (
    <span style={{
      fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
      padding: "1px 6px", borderRadius: "4px",
      background: bg, color, border: `1px solid ${border}`,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// Detect if this is a summer semester from the label
function isSummer(label) {
  return label && label.toLowerCase().includes("summer");
}

export default function SemesterColumn({ semesterNumber, label, courses, totalCredits, courseCount }) {
  const summer = isSummer(label);

  // Summer columns get a different header color
  const headerBg = summer ? "#b8860b" : "#1a6b3c";

  return (
    <div style={{
      minWidth: "220px", maxWidth: "240px",
      background: "#ffffff",
      border: `1.5px solid ${summer ? "#f0d080" : "#e0e0e0"}`,
      borderRadius: "12px", overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        background: headerBg, color: "#ffffff",
        padding: "12px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: "11px", opacity: 0.8, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {summer ? "☀ Summer" : "Semester"}
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1.2 }}>
            {label || semesterNumber}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "18px", fontWeight: 700 }}>{totalCredits}</div>
          <div style={{ fontSize: "10px", opacity: 0.75 }}>credits</div>
        </div>
      </div>

      {/* Course List */}
      <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {courses.map((course) => {
          const dept = course.department || course.code?.match(/^[A-Z]+/)?.[0] || "DEFAULT";
          const style = getDeptStyle(dept);
          return (
            <div key={course.code} style={{
              background: style.bg, border: `1px solid ${style.border}`,
              borderRadius: "8px", padding: "8px 10px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" }}>
                <span style={{
                  fontFamily: "monospace", fontSize: "11px", fontWeight: 700,
                  color: style.text, whiteSpace: "nowrap",
                }}>
                  {course.code}
                </span>
                <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                  <CourseTag course_type={course.course_type} />
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#666", whiteSpace: "nowrap" }}>
                    {course.credits}cr
                  </span>
                </div>
              </div>
              <div style={{ fontSize: "11.5px", color: "#333", marginTop: "3px", lineHeight: 1.35 }}>
                {course.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid #e8e8e8", padding: "8px 16px",
        fontSize: "11px", color: "#888",
        display: "flex", justifyContent: "space-between",
      }}>
        <span>{courseCount} courses</span>
        <span>{totalCredits} credits</span>
      </div>
    </div>
  );
}
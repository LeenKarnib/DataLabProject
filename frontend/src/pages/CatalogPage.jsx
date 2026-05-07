import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000/api";

const LAU_GREEN = "#1a6b3c";
const LAU_GREEN_DARK = "#145430";
const LAU_GREEN_LIGHT = "#f0f7f3";
const LAU_GREEN_BORDER = "#d4e8db";
const LAU_GREEN_BADGE_BG = "#e6f4ec";

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Required", value: "required" },
  { label: "Elective", value: "elective" },
  { label: "Lab", value: "lab" },
];

function semLabel(s) {
  return s === "both" ? "Fall & Spring"
    : s === "fall" ? "Fall only"
    : s === "spring" ? "Spring only"
    : s === "summer" ? "Summer only"
    : s;
}

const TYPE_BADGE = {
  required: { bg: "#e6f1fb", text: "#0c447c", border: "#b5d4f4" },
  elective:  { bg: "#eaf3de", text: "#27500a", border: "#c0dd97" },
  lab:       { bg: "#faeeda", text: "#633806", border: "#fac775" },
};

function SemesterBadge({ offered }) {
  return (
    <span style={{
      fontSize: 11, padding: "2px 8px", borderRadius: 99,
      background: "#f5f5f5", color: "#888", border: "0.5px solid #ddd",
      fontWeight: 500, letterSpacing: "0.02em"
    }}>{semLabel(offered)}</span>
  );
}

function TypeBadge({ type }) {
  const c = TYPE_BADGE[type] || TYPE_BADGE.required;
  return (
    <span style={{
      fontSize: 11, padding: "2px 8px", borderRadius: 99,
      background: c.bg, color: c.text, border: `0.5px solid ${c.border}`,
      fontWeight: 500, letterSpacing: "0.02em", textTransform: "capitalize"
    }}>{type}</span>
  );
}

function DeptTag({ dept }) {
  return (
    <span style={{
      fontSize: 11, padding: "2px 8px", borderRadius: 99,
      background: LAU_GREEN_BADGE_BG, color: LAU_GREEN,
      border: "0.5px solid #b2d8c0",
      fontWeight: 600, letterSpacing: "0.04em"
    }}>{dept}</span>
  );
}

function LogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3 17L7 10L10 14L13 8L17 17H3Z" fill="white" opacity="0.9" />
      <circle cx="14" cy="5" r="2.5" fill="white" />
    </svg>
  );
}

function CourseCard({ course, onClick, completed, onToggle }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div
      onClick={() => onClick(course)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: hovered
          ? `0.5px solid ${LAU_GREEN}`
          : `0.5px solid ${LAU_GREEN_BORDER}`,
        borderRadius: 12,
        padding: "1rem 1.1rem",
        cursor: "pointer",
        transition: "border-color 0.15s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
        opacity: completed.has(course.code) ? 0.4 : 1,
        gap: 10,
      }}
    >
      {/* ✅ Checkbox (stops click from opening modal) */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <input
          type="checkbox"
          checked={completed.has(course.code)}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            onToggle(course.code, e.target.checked)
          }
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <p style={{
            margin: 0, fontFamily: "'Courier New', monospace",
            fontSize: 11, color: "#999", letterSpacing: "0.05em", fontWeight: 500
          }}>{course.code}</p>
          <p style={{
            margin: "3px 0 0", fontSize: 13, fontWeight: 500,
            color: "#111", lineHeight: 1.35
          }}>{course.name}</p>
          {completed.has(course.code) && (
             <span style={{ fontSize: 11, color: "green" }}>✔ Completed</span>
          )}
        </div>
        <span style={{
          flexShrink: 0, fontSize: 20, fontWeight: 500,
          color: "#bbb", lineHeight: 1
        }}>{course.credits}<span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>cr</span></span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        <DeptTag dept={course.department} />
        <TypeBadge type={course.course_type} />
        <SemesterBadge offered={course.offered_semesters} />
      </div>

      <p style={{
        margin: 0, fontSize: 11, color: "#bbb",
        borderTop: `0.5px solid ${LAU_GREEN_BORDER}`, paddingTop: 8
      }}>View prerequisites →</p>
    </div>
  );
}

function Modal({ course, prereqs, loading, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 14,
        border: `0.5px solid ${LAU_GREEN_BORDER}`,
        padding: "1.5rem", width: "100%", maxWidth: 500,
        maxHeight: "80vh", overflowY: "auto",
        fontFamily: "Segoe UI, sans-serif"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <p style={{
              margin: 0, fontFamily: "'Courier New', monospace",
              fontSize: 11, color: "#999", letterSpacing: "0.08em"
            }}>{course.code}</p>
            <h2 style={{
              margin: "4px 0 0", fontSize: 17, fontWeight: 500,
              color: "#111", lineHeight: 1.3
            }}>{course.name}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#888", fontSize: 20, lineHeight: 1, padding: 4
            }}
          >×</button>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8, marginBottom: "1.25rem"
        }}>
          {[
            { label: "Credits", value: `${course.credits} credits` },
            { label: "Department", value: course.department },
            { label: "Offered", value: semLabel(course.offered_semesters) },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: LAU_GREEN_LIGHT, borderRadius: 8, padding: "10px 12px"
            }}>
              <p style={{ margin: 0, fontSize: 11, color: "#666" }}>{label}</p>
              <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 500, color: "#111" }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <TypeBadge type={course.course_type} />
        </div>

        <div style={{ borderTop: `0.5px solid ${LAU_GREEN_BORDER}`, paddingTop: "1rem" }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 500, color: "#666" }}>
            Prerequisites
          </p>
          {loading ? (
            <p style={{ fontSize: 13, color: "#999" }}>Loading...</p>
          ) : prereqs.length === 0 ? (
            <p style={{
              fontSize: 13, color: "#999", textAlign: "center",
              padding: "10px 12px", background: LAU_GREEN_LIGHT, borderRadius: 8
            }}>No prerequisites — open to all students</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {prereqs.map((p) => (
                <div key={p.code} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px",
                  background: LAU_GREEN_LIGHT,
                  borderRadius: 8, border: `0.5px solid ${LAU_GREEN_BORDER}`
                }}>
                  <div>
                    <span style={{
                      fontFamily: "'Courier New', monospace", fontSize: 11,
                      color: "#999", letterSpacing: "0.06em"
                    }}>{p.code}</span>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#111" }}>{p.name}</p>
                  </div>
                  <span style={{ fontSize: 13, color: "#999" }}>{p.credits} cr</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [completed, setCompleted] = useState(new Set());
  const [courses, setCourses]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [query, setQuery]         = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [prereqs, setPrereqs]     = useState([]);
  const [prereqLoading, setPrereqLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/courses`)
      .then((r) => r.json())
      .then((data) => { setCourses(data); setFiltered(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  useEffect(() => {
    const fetchCompleted = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/courses/completed/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCompleted(new Set(data));
    } catch (err) {
      console.error("Error loading completed courses");
    }
  };

  fetchCompleted();
}, []);
  const applyFilters = useCallback((q, type, list) => {
    const uq = q.toUpperCase().trim();
    return list.filter((c) => {
      const matchSearch = !uq || c.code.toUpperCase().includes(uq) || c.name.toUpperCase().includes(uq);
      const matchType = !type || c.course_type === type;
      return matchSearch && matchType;
    });
  }, []);

  useEffect(() => {
    setFiltered(applyFilters(query, typeFilter, courses));
  }, [query, typeFilter, courses, applyFilters]);

  function openCourse(course) {
    setSelected(course);
    setPrereqs([]);
    setPrereqLoading(true);
    fetch(`${API}/courses/${course.code}/prerequisites`)
      .then((r) => r.json())
      .then((data) => { setPrereqs(data); setPrereqLoading(false); })
      .catch(() => setPrereqLoading(false));
  }

  const handleCompletedToggle = async (courseCode, isChecked) => {
  try {
    const token = localStorage.getItem("token");

    if (isChecked) {
      await fetch(`${API}/courses/completed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseCode }),
      });
    } else {
      await fetch(`${API}/courses/completed/${courseCode}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    setCompleted(prev => {
      const newSet = new Set(prev);
      if (isChecked) newSet.add(courseCode);
      else newSet.delete(courseCode);
      return newSet;
    });

  } catch (err) {
    console.error("Error updating completed course");
  }
};
  return (
    <div style={{ minHeight: "100vh", background: LAU_GREEN_LIGHT, fontFamily: "Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{
        background: "#fff",
        borderBottom: `0.5px solid ${LAU_GREEN_BORDER}`,
        padding: "1.25rem 2rem 1rem",
        display: "flex", alignItems: "center", gap: 12
      }}>
        <div style={{
          width: 32, height: 32, background: LAU_GREEN,
          borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <LogoIcon />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: LAU_GREEN }}>Course Catalog</h1>
          <p style={{ margin: "1px 0 0", fontSize: 12, color: "#666" }}>
            {loading ? "Loading..." : `${filtered.length} of ${courses.length} courses`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff",
        borderBottom: `0.5px solid ${LAU_GREEN_BORDER}`,
        padding: "0.75rem 2rem",
        display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap"
      }}>
        <input
          type="text"
          placeholder="Search by code or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1, minWidth: 200, maxWidth: 320,
            padding: "8px 12px", fontSize: 13,
            border: "0.5px solid #ccc",
            borderRadius: 8, background: LAU_GREEN_LIGHT,
            color: "#111", outline: "none", fontFamily: "inherit"
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 500,
                borderRadius: 99, cursor: "pointer", transition: "all 0.15s",
                fontFamily: "inherit",
                border: typeFilter === f.value
                  ? `0.5px solid ${LAU_GREEN}`
                  : "0.5px solid #e5e5e5",
                background: typeFilter === f.value ? LAU_GREEN_BADGE_BG : "#fff",
                color: typeFilter === f.value ? LAU_GREEN : "#888",
              }}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "1.5rem 2rem" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{
                height: 130, borderRadius: 12,
                background: "#fff", border: `0.5px solid ${LAU_GREEN_BORDER}`,
                animation: "pulse 1.5s ease-in-out infinite"
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ fontSize: 14, color: "#999" }}>No courses match your search.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {filtered.map((course) => (
              <CourseCard
                key={course.code}
                course={course}
                onClick={openCourse}
                completed={completed}
                onToggle={handleCompletedToggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <Modal
          course={selected}
          prereqs={prereqs}
          loading={prereqLoading}
          onClose={() => setSelected(null)}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
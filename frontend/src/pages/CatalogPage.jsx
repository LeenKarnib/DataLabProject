import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000/api";

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Required", value: "required" },
  { label: "Elective", value: "elective" },
  { label: "Lab", value: "lab" },
];

const DEPT_COLORS = {
  COE: { bg: "#E6F1FB", text: "#0C447C", border: "#378ADD" },
  ELE: { bg: "#E1F5EE", text: "#085041", border: "#1D9E75" },
  MCE: { bg: "#FAEEDA", text: "#633806", border: "#BA7517" },
  MTH: { bg: "#EEEDFE", text: "#3C3489", border: "#7F77DD" },
  PHY: { bg: "#FAECE7", text: "#712B13", border: "#D85A30" },
  GNE: { bg: "#EAF3DE", text: "#27500A", border: "#639922" },
  MEE: { bg: "#FBEAF0", text: "#72243E", border: "#D4537E" },
  INE: { bg: "#FCEBEB", text: "#791F1F", border: "#E24B4A" },
  CIE: { bg: "#F1EFE8", text: "#444441", border: "#888780" },
};

const TYPE_BADGE = {
  required: { bg: "#E6F1FB", text: "#0C447C" },
  elective:  { bg: "#EAF3DE", text: "#27500A" },
  lab:       { bg: "#FAEEDA", text: "#633806" },
};

function getDeptColor(dept) {
  return DEPT_COLORS[dept] || { bg: "#F1EFE8", text: "#444441", border: "#888780" };
}

function SemesterBadge({ offered }) {
  const label =
    offered === "both" ? "Fall & Spring" :
    offered === "fall" ? "Fall only" :
    offered === "spring" ? "Spring only" :
    offered === "summer" ? "Summer only" : offered;
  return (
    <span style={{
      fontSize: 11, padding: "2px 8px", borderRadius: 99,
      background: "#F1EFE8", color: "#5F5E5A", border: "0.5px solid #D3D1C7",
      fontWeight: 500, letterSpacing: "0.02em"
    }}>{label}</span>
  );
}

function TypeBadge({ type }) {
  const colors = TYPE_BADGE[type] || TYPE_BADGE.required;
  return (
    <span style={{
      fontSize: 11, padding: "2px 8px", borderRadius: 99,
      background: colors.bg, color: colors.text,
      border: `0.5px solid ${colors.text}33`,
      fontWeight: 500, letterSpacing: "0.02em", textTransform: "capitalize"
    }}>{type}</span>
  );
}

function DeptTag({ dept }) {
  const c = getDeptColor(dept);
  return (
    <span style={{
      fontSize: 11, padding: "2px 8px", borderRadius: 99,
      background: c.bg, color: c.text, border: `0.5px solid ${c.border}55`,
      fontWeight: 600, letterSpacing: "0.04em"
    }}>{dept}</span>
  );
}

function CourseCard({ course, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(course)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--color-background-primary)",
        border: hovered
          ? "0.5px solid var(--color-border-secondary)"
          : "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12,
        padding: "1rem 1.25rem",
        cursor: "pointer",
        transition: "border-color 0.15s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <p style={{
            margin: 0, fontFamily: "'DM Mono', monospace",
            fontSize: 12, color: "var(--color-text-secondary)",
            letterSpacing: "0.06em", fontWeight: 500
          }}>{course.code}</p>
          <p style={{
            margin: "3px 0 0", fontSize: 14, fontWeight: 500,
            color: "var(--color-text-primary)", lineHeight: 1.35
          }}>{course.name}</p>
        </div>
        <span style={{
          flexShrink: 0,
          fontSize: 20, fontWeight: 700,
          color: "var(--color-text-tertiary)",
          lineHeight: 1
        }}>{course.credits}<span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>cr</span></span>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <DeptTag dept={course.department} />
        <TypeBadge type={course.course_type} />
        <SemesterBadge offered={course.offered_semesters} />
      </div>

      {/* Footer hint */}
      <p style={{
        margin: 0, fontSize: 11, color: "var(--color-text-tertiary)",
        borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 8
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
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div style={{
        background: "var(--color-background-primary)",
        borderRadius: 16, border: "0.5px solid var(--color-border-tertiary)",
        padding: "1.5rem", width: "100%", maxWidth: 520,
        maxHeight: "80vh", overflowY: "auto"
      }}>
        {/* Modal header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <p style={{
              margin: 0, fontFamily: "'DM Mono', monospace",
              fontSize: 11, color: "var(--color-text-secondary)", letterSpacing: "0.08em"
            }}>{course.code}</p>
            <h2 style={{
              margin: "4px 0 0", fontSize: 18, fontWeight: 500,
              color: "var(--color-text-primary)", lineHeight: 1.3
            }}>{course.name}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--color-text-secondary)", fontSize: 20, lineHeight: 1, padding: 4
            }}
          >×</button>
        </div>

        {/* Info grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8, marginBottom: "1.25rem"
        }}>
          {[
            { label: "Credits", value: `${course.credits} credits` },
            { label: "Department", value: course.department },
            { label: "Offered", value: course.offered_semesters === "both" ? "Fall & Spring" : course.offered_semesters },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "var(--color-background-secondary)",
              borderRadius: 8, padding: "10px 12px"
            }}>
              <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>{label}</p>
              <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Type badge */}
        <div style={{ marginBottom: "1.25rem" }}>
          <TypeBadge type={course.course_type} />
        </div>

        {/* Prerequisites */}
        <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: "1rem" }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>
            Prerequisites
          </p>
          {loading ? (
            <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>Loading...</p>
          ) : prereqs.length === 0 ? (
            <p style={{
              fontSize: 13, color: "var(--color-text-tertiary)",
              padding: "10px 12px", background: "var(--color-background-secondary)",
              borderRadius: 8
            }}>No prerequisites — open to all students</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {prereqs.map((p) => (
                <div key={p.code} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px",
                  background: "var(--color-background-secondary)",
                  borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)"
                }}>
                  <div>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 11,
                      color: "var(--color-text-secondary)", letterSpacing: "0.06em"
                    }}>{p.code}</span>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--color-text-primary)" }}>{p.name}</p>
                  </div>
                  <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>{p.credits} cr</span>
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
  const [courses, setCourses]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [query, setQuery]         = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [prereqs, setPrereqs]     = useState([]);
  const [prereqLoading, setPrereqLoading] = useState(false);

  // Load all courses once
  useEffect(() => {
    fetch(`${API}/courses`)
      .then((r) => r.json())
      .then((data) => {
        setCourses(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter whenever query or typeFilter changes
  const applyFilters = useCallback((q, type, list) => {
    const uq = q.toUpperCase().trim();
    return list.filter((c) => {
      const matchSearch = !uq ||
        c.code.toUpperCase().includes(uq) ||
        c.name.toUpperCase().includes(uq);
      const matchType = !type || c.course_type === type;
      return matchSearch && matchType;
    });
  }, []);

  useEffect(() => {
    setFiltered(applyFilters(query, typeFilter, courses));
  }, [query, typeFilter, courses, applyFilters]);

  // Open modal + fetch prereqs
  function openCourse(course) {
    setSelected(course);
    setPrereqs([]);
    setPrereqLoading(true);
    fetch(`${API}/courses/${course.code}/prerequisites`)
      .then((r) => r.json())
      .then((data) => { setPrereqs(data); setPrereqLoading(false); })
      .catch(() => setPrereqLoading(false));
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      {/* Header */}
      <div style={{
        background: "var(--color-background-primary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        padding: "1.5rem 2rem"
      }}>
        <h1 style={{
          margin: "0 0 4px",
          fontSize: 22, fontWeight: 500,
          color: "var(--color-text-primary)",
          fontFamily: "'DM Mono', monospace", letterSpacing: "-0.01em"
        }}>Course Catalog</h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
          {loading ? "Loading..." : `${filtered.length} of ${courses.length} courses`}
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: "var(--color-background-primary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        padding: "0.75rem 2rem",
        display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap"
      }}>
        <input
          type="text"
          placeholder="Search by code or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1, minWidth: 200, maxWidth: 340,
            padding: "7px 12px", fontSize: 13,
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: 8, background: "var(--color-background-secondary)",
            color: "var(--color-text-primary)", outline: "none"
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
                border: typeFilter === f.value
                  ? "0.5px solid #378ADD"
                  : "0.5px solid var(--color-border-tertiary)",
                background: typeFilter === f.value ? "#E6F1FB" : "var(--color-background-secondary)",
                color: typeFilter === f.value ? "#0C447C" : "var(--color-text-secondary)",
              }}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "1.5rem 2rem" }}>
        {loading ? (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12
          }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{
                height: 130, borderRadius: 12,
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                animation: "pulse 1.5s ease-in-out infinite"
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ fontSize: 15, color: "var(--color-text-secondary)" }}>No courses match your search.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12
          }}>
            {filtered.map((course) => (
              <CourseCard key={course.code} course={course} onClick={openCourse} />
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
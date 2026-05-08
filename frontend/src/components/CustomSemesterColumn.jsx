
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCorners,
} from "@dnd-kit/core";
import { fetchCustomPlan, saveCustomPlan, resetCustomPlan } from "../api/customPlanner";
import { validateDrop, SCHEDULE } from "../utils/validateDrop";
import InvalidDropModal from "../components/InvalidDropModal";


const DEPT_COLORS = {
  COE:  { bg: "#e8f5ee", text: "#1a6b3c", border: "#a8d5b5" },
  ELE:  { bg: "#e8f0fb", text: "#1a3a7a", border: "#a8bfef" },
  MCE:  { bg: "#fef3e8", text: "#7a3a1a", border: "#efcfa8" },
  MEE:  { bg: "#fbf0f3", text: "#7a1a3a", border: "#efa8bf" },
  MTH:  { bg: "#f3f0fb", text: "#3a1a7a", border: "#c0a8ef" },
  PHY:  { bg: "#f0fbfb", text: "#1a5a6b", border: "#a8d5df" },
  GNE:  { bg: "#fbf3e8", text: "#6b4a1a", border: "#efd5a8" },
  INE:  { bg: "#fafbf0", text: "#4a5a1a", border: "#d5efa8" },
  ENG:  { bg: "#fdf8f0", text: "#7a5a1a", border: "#efdfb0" },
  COM:  { bg: "#fdf8f0", text: "#7a5a1a", border: "#efdfb0" },
  LAS:  { bg: "#f8f8f8", text: "#555",    border: "#ddd"    },
  FREE: { bg: "#f8f8f8", text: "#555",    border: "#ddd"    },
  DEFAULT: { bg: "#f5f5f5", text: "#444", border: "#ccc"    },
};

function getDeptStyle(code, department) {
  const dept = department || code?.match(/^[A-Z]+/)?.[0] || "DEFAULT";
  return DEPT_COLORS[dept] || DEPT_COLORS.DEFAULT;
}

function isSummer(label) {
  return label?.toLowerCase().includes("summer");
}

// Draggable course card
function CourseCard({ course, isDragging, isOverlay }) {
  const style = getDeptStyle(course.code, course.department);

  return (
    <div
      style={{
        background: style.bg,
        border: `1.5px solid ${style.border}`,
        borderRadius: "8px",
        padding: "8px 10px",
        opacity: isDragging && !isOverlay ? 0.35 : 1,
        boxShadow: isOverlay ? "0 8px 24px rgba(0,0,0,0.15)" : "none",
        transform: isOverlay ? "rotate(1.5deg)" : "none",
        transition: "opacity 0.15s",
        userSelect: "none",
        cursor: isOverlay ? "grabbing" : "grab",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" }}>
        <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: style.text, whiteSpace: "nowrap" }}>
          {course.code}
        </span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#666", whiteSpace: "nowrap" }}>
          {course.credits}cr
        </span>
      </div>
      <div style={{ fontSize: "11px", color: "#444", marginTop: "3px", lineHeight: 1.35 }}>
        {course.name}
      </div>
      {course.completed && (
        <div style={{ marginTop: "4px", fontSize: "10px", color: "#1a6b3c", fontWeight: 600 }}>
          ✓ Completed
        </div>
      )}
    </div>
  );
}

// Draggable wrapper 
function DraggableCourse({ course, activeId }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: course.code,
    data: { course },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <CourseCard course={course} isDragging={isDragging} />
    </div>
  );
}

// Droppable semester column
function SemesterColumn({ label, courses, isOver, totalCredits, slotMax }) {
  const summer = isSummer(label);
  const headerBg = summer ? "#b8860b" : "#1a6b3c";
  const overCapacity = totalCredits > slotMax;

  return (
    <div
      style={{
        minWidth: "210px",
        maxWidth: "210px",
        background: isOver ? "#f0faf4" : "#fff",
        border: `1.5px solid ${isOver ? "#1a6b3c" : summer ? "#f0d080" : "#e0e0e0"}`,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: isOver ? "0 0 0 2px #1a6b3c44" : "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
      }}
    >
      {/* Header */}
      <div style={{ background: headerBg, color: "#fff", padding: "10px 14px" }}>
        <div style={{ fontSize: "10px", opacity: 0.8, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {summer ? "☀ Summer" : "Semester"}
        </div>
        <div style={{ fontSize: "16px", fontWeight: 800, lineHeight: 1.2 }}>{label}</div>
        <div style={{ marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "10px", opacity: 0.75 }}>{courses.length} courses</span>
          <span style={{
            fontSize: "11px", fontWeight: 700,
            color: overCapacity ? "#ffd0d0" : "#fff",
          }}>
            {totalCredits} / {slotMax} cr
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "5px", flex: 1, minHeight: "60px" }}>
        {courses.length === 0 && (
          <div style={{
            border: "1.5px dashed #ccc", borderRadius: "7px",
            height: "52px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", color: "#bbb",
          }}>
            Drop courses here
          </div>
        )}
        {courses.map((course) => (
          <DraggableCourse key={course.code} course={course} />
        ))}
      </div>
    </div>
  );
}

// Wrapper that makes the column a droppable zone
function DroppableColumn({ label, courses, activeId, slotMax }) {
  const { setNodeRef, isOver } = useDroppable({ id: label });
  const totalCredits = courses.reduce((s, c) => s + (c.credits || 3), 0);

  return (
    <div ref={setNodeRef}>
      <SemesterColumn
        label={label}
        courses={courses}
        isOver={isOver}
        totalCredits={totalCredits}
        slotMax={slotMax}
      />
    </div>
  );
}

// Droppable unscheduled pool
function DroppablePool({ courses }) {
  const { setNodeRef, isOver } = useDroppable({ id: "UNSCHEDULED" });

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? "#f0faf4" : "#f7f8f9",
        border: `1.5px solid ${isOver ? "#1a6b3c" : "#e0e0e0"}`,
        borderRadius: "10px",
        padding: "10px 12px",
        transition: "border-color 0.15s, background 0.15s",
        boxShadow: isOver ? "0 0 0 2px #1a6b3c44" : "none",
      }}
    >
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
        Unscheduled — {courses.length} courses
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {courses.length === 0 && (
          <div style={{ fontSize: "12px", color: "#bbb", padding: "8px 0" }}>
            All courses scheduled 🎉
          </div>
        )}
        {courses.map((course) => (
          <div key={course.code} style={{ minWidth: "190px", maxWidth: "220px" }}>
            <DraggableCourse course={course} />
          </div>
        ))}
      </div>
    </div>
  );
}

// main page
export default function CustomPlannerPage() {
  const major = localStorage.getItem("major") || "COE";

  const [semesters, setSemesters] = useState({}); 
  const [unscheduled, setUnscheduled] = useState([]);
  const [prereqMap, setPrereqMap] = useState({});
  const [schedule, setSchedule] = useState(SCHEDULE);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [activeId, setActiveId] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);

  const [modal, setModal] = useState(null); 

  // load plan 
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCustomPlan(major);
        if (!cancelled) {
          setSemesters(data.semesters);
          setUnscheduled(data.unscheduled);
          setPrereqMap(data.prereqMap || {});
          if (data.schedule) setSchedule(data.schedule);
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

  // save plan
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const assignments = [];
      for (const [label, courses] of Object.entries(semesters)) {
        for (const course of courses) {
          assignments.push({ course_code: course.code, semester_label: label });
        }
      }
      await saveCustomPlan(major, assignments);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  }, [semesters, major]);

  // reset plan
  const handleReset = useCallback(async () => {
    if (!window.confirm("Reset your entire custom plan? This cannot be undone.")) return;
    try {
      await resetCustomPlan(major);
      // Reload
      const data = await fetchCustomPlan(major);
      setSemesters(data.semesters);
      setUnscheduled(data.unscheduled);
    } catch (err) {
      alert("Failed to reset: " + err.message);
    }
  }, [major]);

  // sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Find which container a course is currently in
  function findContainer(courseCode) {
    if (unscheduled.find((c) => c.code === courseCode)) return "UNSCHEDULED";
    for (const label of Object.keys(semesters)) {
      if (semesters[label].find((c) => c.code === courseCode)) return label;
    }
    return null;
  }

  function findCourse(courseCode) {
    const u = unscheduled.find((c) => c.code === courseCode);
    if (u) return u;
    for (const courses of Object.values(semesters)) {
      const c = courses.find((c) => c.code === courseCode);
      if (c) return c;
    }
    return null;
  }

  function handleDragStart({ active }) {
    setActiveId(active.id);
    setActiveCourse(findCourse(active.id));
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    setActiveCourse(null);
    if (!over) return;

    const courseCode = active.id;
    const targetLabel = over.id; // semester label or "UNSCHEDULED"
    const sourceContainer = findContainer(courseCode);
    const course = findCourse(courseCode);

    if (!course || sourceContainer === targetLabel) return;

    //  Validate if dropping into a semester 
    if (targetLabel !== "UNSCHEDULED") {
      const { valid, reasons } = validateDrop(course, targetLabel, semesters, prereqMap);
      if (!valid) {
        setModal({ course, targetLabel, reasons });
        return;
      }
    }

    // Move the course 
    setSemesters((prev) => {
      const next = {};
      for (const [label, courses] of Object.entries(prev)) {
        next[label] = courses.filter((c) => c.code !== courseCode);
      }
      if (targetLabel !== "UNSCHEDULED") {
        next[targetLabel] = [...(next[targetLabel] || []), course];
      }
      return next;
    });

    setUnscheduled((prev) => {
      const filtered = prev.filter((c) => c.code !== courseCode);
      if (targetLabel === "UNSCHEDULED") return [...filtered, course];
      return filtered;
    });
  }

  // stats
  const totalScheduled = Object.values(semesters).flat().length;
  const totalAll = totalScheduled + unscheduled.length;
  const scheduledCredits = Object.values(semesters)
    .flat()
    .reduce((s, c) => s + (c.credits || 3), 0);

  // Render 
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8f9", fontFamily: "'DM Sans', 'Geist', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: "#1a6b3c", color: "#fff", padding: "22px 32px 20px", borderBottom: "3px solid #145530" }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "11px", opacity: 0.7, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                DegreeMap — {major}
              </p>
              <h1 style={{ margin: "4px 0 2px", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.4px" }}>
                Custom Planner
              </h1>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.75 }}>
                Drag courses into semesters — prerequisites & credit limits are enforced automatically
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* Stats */}
              <div style={{ display: "flex", gap: "18px" }}>
                <Stat label="Scheduled" value={`${totalScheduled} / ${totalAll}`} />
                <Stat label="Credits Planned" value={scheduledCredits} />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleReset}
                  style={{
                    background: "transparent", color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.3)", borderRadius: "7px",
                    padding: "8px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  ↺ Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: saveSuccess ? "#22c55e" : "#fff",
                    color: saveSuccess ? "#fff" : "#1a6b3c",
                    border: "none", borderRadius: "7px",
                    padding: "8px 20px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                    transition: "background 0.3s, color 0.3s",
                  }}
                >
                  {saving ? "Saving..." : saveSuccess ? "✓ Saved!" : "Save Plan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "24px 32px" }}>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Unscheduled pool */}
          <div style={{ marginBottom: "24px" }}>
            <DroppablePool courses={unscheduled} />
          </div>

          {/* Semester columns — horizontally scrollable */}
          <div style={{ overflowX: "auto", paddingBottom: "16px" }}>
            <div style={{ display: "flex", gap: "14px", minWidth: "max-content", alignItems: "flex-start" }}>
              {SCHEDULE.map((slot) => {
                const courses = semesters[slot.label] || [];
                return (
                  <DroppableColumn
                    key={slot.label}
                    label={slot.label}
                    courses={courses}
                    activeId={activeId}
                    slotMax={slot.max}
                  />
                );
              })}
            </div>
          </div>

          {/* Drag overlay — follows cursor */}
          <DragOverlay dropAnimation={null}>
            {activeCourse ? (
              <div style={{ width: "190px" }}>
                <CourseCard course={activeCourse} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Legend */}
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { dept: "COE", label: "Computer Eng", color: "#1a6b3c" },
            { dept: "ELE", label: "Electrical Eng", color: "#1a3a7a" },
            { dept: "MCE", label: "Mechatronics", color: "#7a3a1a" },
            { dept: "MTH/PHY", label: "Math & Science", color: "#3a1a7a" },
            { dept: "GNE/INE", label: "General Eng", color: "#6b4a1a" },
          ].map((l) => (
            <div key={l.dept} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#666" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "2px", background: l.color, display: "inline-block" }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Invalid drop modal */}
      {modal && (
        <InvalidDropModal
          course={modal.course}
          targetLabel={modal.targetLabel}
          reasons={modal.reasons}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}



function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "22px", fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: "10px", opacity: 0.7, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid #e0e0e0", borderTop: "3px solid #1a6b3c", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#888", fontSize: "13px" }}>Loading your plan...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
      <p style={{ color: "#c0392b", fontWeight: 600 }}>⚠ {message}</p>
      <button onClick={onRetry} style={{ background: "#1a6b3c", color: "#fff", border: "none", borderRadius: "7px", padding: "8px 20px", cursor: "pointer", fontSize: "13px" }}>
        Retry
      </button>
    </div>
  );
}
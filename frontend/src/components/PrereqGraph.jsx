import React, { useMemo, useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";


const DEPT_COLORS = {
  COE: { bg: "#0f2d1c", border: "#1a6b3c", text: "#4ade80", glow: "#1a6b3c" },
  ELE: { bg: "#0d1a33", border: "#1a3a7a", text: "#60a5fa", glow: "#1a3a7a" },
  MCE: { bg: "#2d1508", border: "#7a3a1a", text: "#fb923c", glow: "#7a3a1a" },
  MEE: { bg: "#2d1508", border: "#7a3a1a", text: "#fb923c", glow: "#7a3a1a" },
  MTH: { bg: "#1a0d33", border: "#3a1a7a", text: "#a78bfa", glow: "#3a1a7a" },
  PHY: { bg: "#1a0d33", border: "#3a1a7a", text: "#a78bfa", glow: "#3a1a7a" },
  GNE: { bg: "#1c1508", border: "#6b4a1a", text: "#fcd34d", glow: "#6b4a1a" },
  INE: { bg: "#1c1508", border: "#6b4a1a", text: "#fcd34d", glow: "#6b4a1a" },
  ENG: { bg: "#1a1a1a", border: "#555",    text: "#d4d4d4", glow: "#555"    },
  DEFAULT: { bg: "#1a1a1a", border: "#555", text: "#d4d4d4", glow: "#555"   },
};

function getDeptColor(code) {
  const dept = code?.replace(/[^A-Z]/g, "").slice(0, 3);
  return DEPT_COLORS[dept] || DEPT_COLORS.DEFAULT;
}


function CourseNode({ data }) {
  const { code, name, credits, completed, year_standing, highlighted, dimmed } = data;
  const colors = getDeptColor(code);

  const opacity = dimmed ? 0.25 : 1;
  const scale = highlighted ? "scale(1.07)" : "scale(1)";
  const shadowSize = highlighted ? `0 0 18px 4px ${colors.glow}99` : `0 0 8px 2px ${colors.glow}44`;

  return (
    <div
      style={{
        opacity,
        transform: scale,
        transition: "all 0.18s ease",
        background: colors.bg,
        border: `1.5px solid ${completed ? "#22c55e" : colors.border}`,
        borderRadius: "8px",
        padding: "12px 16px",
        minWidth: "180px",
        maxWidth: "220px",
        cursor: "pointer",
        boxShadow: completed
          ? `0 0 12px 3px #22c55e55`
          : shadowSize,
        position: "relative",
      }}
    >
      {/* Completed badge */}
      {completed && (
        <span
          style={{
            position: "absolute",
            top: "-7px",
            right: "-7px",
            background: "#22c55e",
            color: "#000",
            borderRadius: "50%",
            width: "16px",
            height: "16px",
            fontSize: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            boxShadow: "0 0 6px #22c55e",
          }}
        >
          ✓
        </span>
      )}

      {/* Course code */}
      <div
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "14px",
          fontWeight: 700,
          color: colors.text,
          letterSpacing: "0.05em",
          marginBottom: "5px",
        }}
      >
        {code}
      </div>

      {/* Course name */}
      <div
        style={{
          fontSize: "11px",
          color: "#aaa",
          lineHeight: 1.4,
          marginBottom: "8px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {name}
      </div>

      {/* Footer: credits + year */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: "11px",
            color: colors.text,
            opacity: 0.8,
            fontFamily: "monospace",
          }}
        >
          {credits} cr
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "#666",
            fontFamily: "monospace",
          }}
        >
          Y{year_standing}
        </span>
      </div>
    </div>
  );
}

const nodeTypes = { courseNode: CourseNode };


function computeLayout(courses) {
  // Group by year_standing
  const byYear = {};
  for (const c of courses) {
    const y = c.year_standing || 1;
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(c);
  }

  const NODE_W = 220;
  const NODE_H = 130;
  const X_GAP = 40;
  const Y_GAP = 80;

  const positions = {};
  const years = Object.keys(byYear).map(Number).sort();

  let yCursor = 0;
  for (const yr of years) {
    const group = byYear[yr];
    const rowWidth = group.length * (NODE_W + X_GAP) - X_GAP;
    group.forEach((c, i) => {
      positions[c.code] = {
        x: i * (NODE_W + X_GAP) - rowWidth / 2 + 600,
        y: yCursor,
      };
    });
    yCursor += NODE_H + Y_GAP;
  }

  return positions;
}


export default function PrereqGraph({ courses, edges, completedSet }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const positions = useMemo(() => computeLayout(courses), [courses]);

  // Compute highlight sets when a node is selected
  const { prereqsOf, dependentsOf } = useMemo(() => {
    if (!selectedNode) return { prereqsOf: new Set(), dependentsOf: new Set() };
    const prereqsOf = new Set();
    const dependentsOf = new Set();
    for (const e of edges) {
      if (e.target === selectedNode) prereqsOf.add(e.source);
      if (e.source === selectedNode) dependentsOf.add(e.target);
    }
    return { prereqsOf, dependentsOf };
  }, [selectedNode, edges]);

  const rfNodes = useMemo(() => {
    return courses.map((c) => {
      const isSelected = c.code === selectedNode;
      const isPrereq = prereqsOf.has(c.code);
      const isDependent = dependentsOf.has(c.code);
      const anySelected = !!selectedNode;

      return {
        id: c.code,
        type: "courseNode",
        position: positions[c.code] || { x: 0, y: 0 },
        data: {
          code: c.code,
          name: c.name,
          credits: c.credits,
          year_standing: c.year_standing,
          completed: completedSet.has(c.code),
          highlighted: isSelected || isPrereq || isDependent,
          dimmed: anySelected && !isSelected && !isPrereq && !isDependent,
        },
      };
    });
  }, [courses, positions, completedSet, selectedNode, prereqsOf, dependentsOf]);

  const rfEdges = useMemo(() => {
    return edges.map((e, i) => {
      const isRelevant =
        !selectedNode ||
        e.source === selectedNode ||
        e.target === selectedNode ||
        prereqsOf.has(e.source) && e.target === selectedNode ||
        dependentsOf.has(e.target) && e.source === selectedNode;

      const isPrereqEdge = e.target === selectedNode;
      const isDependentEdge = e.source === selectedNode;

      return {
        id: `e-${i}`,
        source: e.source,
        target: e.target,
        type: "smoothstep",
        animated: isPrereqEdge || isDependentEdge,
        style: {
          stroke: isPrereqEdge
            ? "#f59e0b"
            : isDependentEdge
            ? "#60a5fa"
            : selectedNode
            ? "#333"
            : "#2a4a35",
          strokeWidth: isPrereqEdge || isDependentEdge ? 2 : 1,
          opacity: isRelevant ? 1 : 0.08,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isPrereqEdge
            ? "#f59e0b"
            : isDependentEdge
            ? "#60a5fa"
            : selectedNode
            ? "#333"
            : "#2a4a35",
        },
      };
    });
  }, [edges, selectedNode, prereqsOf, dependentsOf]);

  const [nodes, , onNodesChange] = useNodesState(rfNodes);
  const [rfEdgeState, , onEdgesChange] = useEdgesState(rfEdges);

  // Sync derived nodes/edges into state when deps change
  const syncedNodes = rfNodes;
  const syncedEdges = rfEdges;

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode((prev) => (prev === node.id ? null : node.id));
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Selected course detail
  const selectedCourse = selectedNode
    ? courses.find((c) => c.code === selectedNode)
    : null;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ReactFlow
        nodes={syncedNodes}
        edges={syncedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.25}
        maxZoom={2}
        style={{ background: "#0a0f0d" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1a2e22" gap={28} size={1} />
        <Controls
          style={{
            background: "#111",
            border: "1px solid #2a4a35",
            borderRadius: "8px",
          }}
        />
        <MiniMap
          nodeColor={(n) => {
            const colors = getDeptColor(n.id);
            return n.data?.completed ? "#22c55e" : colors.border;
          }}
          style={{
            background: "#0a0f0d",
            border: "1px solid #2a4a35",
            borderRadius: "8px",
          }}
          maskColor="rgba(0,0,0,0.6)"
        />

        {/* Legend panel */}
        <Panel position="top-left">
          <div
            style={{
              background: "rgba(10,15,13,0.92)",
              border: "1px solid #2a4a35",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "10px",
              color: "#888",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#4ade80", marginBottom: "8px", letterSpacing: "0.1em" }}>
              LEGEND
            </div>
            {[
              { color: "#1a6b3c", label: "COE — Computer Eng" },
              { color: "#1a3a7a", label: "ELE — Electrical Eng" },
              { color: "#7a3a1a", label: "MCE — Mechatronics" },
              { color: "#3a1a7a", label: "MTH/PHY — Math & Science" },
              { color: "#6b4a1a", label: "GNE/INE — General Eng" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: l.color, display: "inline-block", flexShrink: 0 }} />
                <span>{l.label}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #2a4a35", marginTop: "8px", paddingTop: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                <span style={{ color: "#f59e0b" }}>→</span><span>Prerequisites</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                <span style={{ color: "#60a5fa" }}>→</span><span>Unlocks (dependents)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#22c55e" }}>✓</span><span>Completed</span>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #2a4a35", marginTop: "8px", paddingTop: "6px", color: "#555" }}>
              Click any node to explore
            </div>
          </div>
        </Panel>

        {/* Selected course detail panel */}
        {selectedCourse && (
          <Panel position="top-right">
            <div
              style={{
                background: "rgba(10,15,13,0.95)",
                border: `1px solid ${getDeptColor(selectedCourse.code).border}`,
                borderRadius: "10px",
                padding: "14px 16px",
                minWidth: "200px",
                maxWidth: "240px",
                backdropFilter: "blur(10px)",
                boxShadow: `0 0 20px ${getDeptColor(selectedCourse.code).glow}44`,
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: getDeptColor(selectedCourse.code).text,
                  marginBottom: "4px",
                }}
              >
                {selectedCourse.code}
              </div>
              <div style={{ fontSize: "11px", color: "#ccc", marginBottom: "10px", lineHeight: 1.4 }}>
                {selectedCourse.name}
              </div>
              <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
                <div style={{ fontSize: "10px", color: "#666" }}>
                  <span style={{ color: "#888" }}>Credits: </span>
                  <span style={{ color: "#ddd" }}>{selectedCourse.credits}</span>
                </div>
                <div style={{ fontSize: "10px", color: "#666" }}>
                  <span style={{ color: "#888" }}>Year: </span>
                  <span style={{ color: "#ddd" }}>{selectedCourse.year_standing}</span>
                </div>
              </div>
              {completedSet.has(selectedCourse.code) && (
                <div style={{ fontSize: "10px", color: "#22c55e", marginBottom: "8px" }}>✓ Completed</div>
              )}
              <div style={{ borderTop: "1px solid #1a2e22", paddingTop: "8px" }}>
                <div style={{ fontSize: "9px", color: "#f59e0b", marginBottom: "3px" }}>
                  REQUIRES ({prereqsOf.size})
                </div>
                {prereqsOf.size === 0 ? (
                  <div style={{ fontSize: "9px", color: "#555" }}>No prerequisites</div>
                ) : (
                  [...prereqsOf].map((code) => (
                    <div key={code} style={{ fontSize: "9px", color: "#aaa", fontFamily: "monospace" }}>
                      {code}
                    </div>
                  ))
                )}
              </div>
              <div style={{ borderTop: "1px solid #1a2e22", paddingTop: "8px", marginTop: "8px" }}>
                <div style={{ fontSize: "9px", color: "#60a5fa", marginBottom: "3px" }}>
                  UNLOCKS ({dependentsOf.size})
                </div>
                {dependentsOf.size === 0 ? (
                  <div style={{ fontSize: "9px", color: "#555" }}>No dependents</div>
                ) : (
                  [...dependentsOf].map((code) => (
                    <div key={code} style={{ fontSize: "9px", color: "#aaa", fontFamily: "monospace" }}>
                      {code}
                    </div>
                  ))
                )}
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
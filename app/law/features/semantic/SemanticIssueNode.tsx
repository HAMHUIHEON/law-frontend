
// law-frontend/app/law/semantic/SemanticIssueNode.tsx

/**
 * SemanticIssueNode
 *
 * - 법령 해석 단계(Semantic)의 "쟁점"을 표현하는 그래프 노드
 * - Flow Graph에서 클릭 가능한 중심 노드 역할
 * - hover 시 시각적 강조만 수행 (상태/로직 없음)
 */

import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";

/* ======================================================
 * Component
 * ====================================================== */

function SemanticIssueNode({ data }: NodeProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.base,
        ...(hovered ? styles.hover : {}),
      }}
    >
      {/* Incoming edge (e.g. ALIGNED_WITH) */}
      <Handle
        type="target"
        position={Position.Top}
        style={styles.hiddenHandle}
      />

      {/* Issue Label */}
      <div style={styles.label}>
        {data.label}
      </div>

      {/* Outgoing edge (확장 대비) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={styles.hiddenHandle}
      />
    </div>
  );
}

/**
 * 그래프 노드는 data가 바뀌지 않는 한
 * 리렌더될 이유가 없으므로 memo 고정
 */
export default memo(SemanticIssueNode);

/* ======================================================
 * Styles
 * ====================================================== */

const styles: Record<string, React.CSSProperties> = {
  base: {
    background: "#fef9c3",
    border: "1px solid #e5e7eb",
    color: "#1f2937",

    borderRadius: 10,
    padding: 14,

    cursor: "pointer",
    userSelect: "none",

    fontSize: 15,
    lineHeight: 1.35,
    fontWeight: 400,
    textAlign: "center",
    whiteSpace: "pre-wrap",

    transition: "all 120ms ease",
  },

  hover: {
    background: "#fbf5a4ff",
    border: "1px solid #f5c60bff",
    boxShadow: "0 8px 18px rgba(0,0,0,0.22)",
  },

  label: {
    pointerEvents: "none", // 드래그/클릭 간섭 방지
  },

  hiddenHandle: {
    opacity: 0,
  },
};

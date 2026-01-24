
// law-frontend/app/law/SemanticIssueNode.tsx

import { memo, useState } from "react";
import { NodeProps, Handle, Position } from "reactflow";

function SemanticIssueNode({ data }: NodeProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#fbf5a4ff" : "#fef9c3",
        border: hover ? "1px solid #f5c60bff" : "1px solid #e5e7eb",
        color: "#1f2937",
        borderRadius: 10,
        padding: 14,
        cursor: "pointer",
        boxShadow: hover
          ? "0 8px 18px rgba(0,0,0,0.22)"
          : "none",
        transition: "all 120ms ease",
        /* 🔑 텍스트 정렬 핵심 */
        fontSize: 15,
        lineHeight: 1.35,
        fontWeight: 400,
        whiteSpace: "pre-wrap",
        textAlign: "center",        // 👈 여기
      }}
    >
      {/* 🔑 incoming edge (ALIGNED_WITH) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0 }}
      />

      {/* label */}
      {data.label}

      {/* (필요하면 outgoing도 대비) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0 }}
      />
    </div>
  );
}

export default memo(SemanticIssueNode);

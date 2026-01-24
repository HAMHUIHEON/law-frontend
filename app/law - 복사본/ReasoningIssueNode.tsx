//law-frontend/app/law/ReasoningIssueNode.tsx


import { memo, useState } from "react";
import { NodeProps, Handle, Position } from "reactflow";

function ReasoningIssueNode({ data }: NodeProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#bff8f9ff": "#e3f7fbff",
        border: hover ? "1px solid #77f4f6ff": "1px solid #cbd5e1",
        color: "#111827",
        borderRadius: 10,
        padding: 14,
        cursor: "pointer",              // 👈 UX 핵심
        boxShadow: hover
          ? "0 8px 18px rgba(53, 93, 179, 0.12)"
          : "none",
        transition: "all 120ms ease",
        fontSize: 15,
        lineHeight: 1.35,
        fontWeight: 400,

        whiteSpace: "pre-wrap",
        textAlign: "center",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0 }}
      />

      {data.label}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0 }}
      />
    </div>
  );
}

export default memo(ReasoningIssueNode);

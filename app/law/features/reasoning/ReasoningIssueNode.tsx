// law-frontend/app/law/reasoning/ReasoningIssueNode.tsx

import { memo, useState } from "react";
import { NodeProps, Handle, Position } from "reactflow";

/**
 * ReasoningIssueNode
 *
 * - 법령 검토(Reasoning) 단계의 "쟁점"을 나타내는 노드
 * - 클릭 시 ReasoningStepView로 이동하는 진입점 역할
 * - SemanticIssueNode와 톤을 맞추되, 색상으로 성격을 구분
 */

function ReasoningIssueNode({ data }: NodeProps) {
  const [hover, setHover] = useState(false);

  const baseStyle: React.CSSProperties = {
    backgroundColor: "#e3f7fb",
    border: "1px solid #cbd5e1",
    color: "#111827",
    borderRadius: 10,
    padding: 14,

    fontSize: 15,
    lineHeight: 1.35,
    fontWeight: 400,

    whiteSpace: "pre-wrap",
    textAlign: "center",
    cursor: "pointer",

    transition: "all 120ms ease",
  };

  const hoverStyle: React.CSSProperties = hover
    ? {
        backgroundColor: "#bff8f9",
        border: "1px solid #77f4f6",
        boxShadow: "0 8px 18px rgba(53, 93, 179, 0.12)",
      }
    : {};

  return (
    <div
      style={{ ...baseStyle, ...hoverStyle }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* incoming edge */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0 }}
      />

      {/* label */}
      {data.label}

      {/* outgoing edge */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0 }}
      />
    </div>
  );
}

export default memo(ReasoningIssueNode);

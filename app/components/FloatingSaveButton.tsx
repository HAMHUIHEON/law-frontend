// law-frontend/app/components/FloatingSaveButton.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function FloatingSaveButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: "fixed", right: 24, bottom: 160, zIndex: 9999 }}>
      {showHint && (
        <div
          style={{
            position: "absolute",
            bottom: 54,
            right: 0,
            padding: "6px 10px",
            borderRadius: 6,
            background: "#111827",
            color: "#fff",
            fontSize: 12,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          }}
        >
          저장
        </div>
      )}

      <button
        onClick={onClick}
        onMouseEnter={(e) => {
          setShowHint(true);
          e.currentTarget.style.background = "#fffbeb";
          e.currentTarget.style.borderColor = "#f59e0b";
          e.currentTarget.style.transform = "scale(1.06)";
        }}
        onMouseLeave={(e) => {
          setShowHint(false);
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.borderColor = "#e5e7eb";
          e.currentTarget.style.transform = "scale(1)";
        }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          border: "1px solid #e5e7eb",
          background: "#fff",
          fontSize: 20,
          cursor: "pointer",
          transition: "all 120ms ease",
        }}
      >
        🔖
      </button>
    </div>,
    document.body
  );
}

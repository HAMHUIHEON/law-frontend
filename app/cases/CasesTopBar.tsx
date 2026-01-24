// law-frontend/app/cases/CasesTopBar.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCaseUI } from "./CaseUIContext";

const CASE_GREEN = "#065f46";

const CASE_MODE_LABEL: Record<string, string> = {
  FLOW: "판례 흐름 요약",
  STRUCTURE: "쟁점 · 판단 구조",
  PRACTICE: "논증 · 실무 활용",
};

const linkStyle: React.CSSProperties = {
  cursor: "pointer",
  textDecoration: "underline",
};

function Separator() {
  return <span style={{ color: "#9ca3af" }}>/</span>;
}

export default function CasesTopBar() {
  const router = useRouter();
  const {
    caseId,          // ✅ 여기서 가져온다
    viewMode,
    sidebarOpen,
    setSidebarOpen,
    resetCase,
  } = useCaseUI();

  const goHome = () => {
    router.push("/enter");
  };

  const goCaseHome = () => {
    router.push("/cases");

    // 다음 tick에서 상태 리셋
    setTimeout(() => {
      resetCase();
      setSidebarOpen(true);
    }, 0);
  };


  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          background: CASE_GREEN,
          color: "#fff",
          cursor: "pointer",
          fontSize: 18,
          fontWeight: 700,
        }}
        title="메뉴"
      >
        ☰
      </button>

      <div
        style={{
          fontSize: 14,
          color: "#374151",
          display: "flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
        }}
      >
        <span style={linkStyle} onClick={goHome}>
          홈
        </span>
        <Separator />

        <span style={linkStyle} onClick={goCaseHome}>
          판례
        </span>
        
        {/* ✅ caseId 있을 때만 마지막 breadcrumb 표시 */}  
        {caseId && (
            <>
              <Separator />
              <span style={{ color: CASE_GREEN, fontWeight: 600 }}>
                {CASE_MODE_LABEL[viewMode]}
              </span>
            </>
          )}
      </div>
    </div>
  );
}

// law-frontend/app/cases/layout.tsx  
"use client";

import React from "react";
import { CaseUIProvider, useCaseUI } from "./CaseUIContext";
import { useRouter } from "next/navigation";
import CaseSidebar from "./CaseSidebar";
import CasesTopBar from "./CasesTopBar";
import { Suspense } from "react";


const CASE_GREEN = "#065f46";

/* ======================================================
 * Sidebar
 * ====================================================== */
function Sidebar() {
  const router = useRouter();

  const {
    sidebarOpen,
    setSidebarOpen,
    caseId,
    setCaseId,
    viewMode,
    setViewMode,
  } = useCaseUI();

  if (!sidebarOpen) return null;

  return (
    <aside
      style={{
        width: 280,
        minWidth: 280,
        borderRight: "1px solid #e5e7eb",
        backgroundColor: "#fafafa",
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 0,
      }}
    >
      {/* =======================
       * 판례 조회
       * ======================= */}
      <section>
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
          판례 조회
        </p>

        <input
          type="text"
          placeholder="사건번호 입력 (예: 2022구합7106)"
          value={caseId ?? ""}
          onChange={(e) => setCaseId(e.target.value)}
          style={{
            width: "100%",
            fontSize: 14,
            padding: "8px 10px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
          }}
        />

        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
          엔터로 조회합니다.
        </div>
      </section>

      {/* =======================
       * 보기 방식
       * ======================= */}
      <section>
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
          보기 방식
        </p>

        {[
          ["FLOW", "판례 흐름 요약"],
          ["STRUCTURE", "쟁점·판단 구조"],
          ["PRACTICE", "논증·실무 활용"],
        ].map(([mode, label]) => (
          <label
            key={mode}
            style={{ display: "block", fontSize: 14, marginBottom: 6 }}
          >
            <input
              type="radio"
              name="caseMode"
              checked={viewMode === (mode as any)}
              onChange={() => setViewMode(mode as any)}
            />{" "}
            {label}
          </label>
        ))}
      </section>

      <hr style={{ borderTop: "1px solid #e5e7eb" }} />

      <button
        onClick={() => setSidebarOpen(false)}
        style={{
          marginTop: 10,
          width: "100%",
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          background: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        사이드바 닫기
      </button>
    </aside>
  );
}

/* ======================================================
 * TopBar (햄버거 + 브레드크럼)
 * ====================================================== */
function TopBar() {
  const router = useRouter();
  const {
    setCaseId,
    sidebarOpen,
    setSidebarOpen,
    viewMode,
  } = useCaseUI();

  const CASE_MODE_LABEL: Record<string, string> = {
    FLOW: "판례 흐름 요약",
    STRUCTURE: "쟁점·판단 구조",
    PRACTICE: "논증·실무 활용",
  };

  const goHome = () => {
    router.push("/");
  };

const goCaseHome = () => {
  setCaseId(null);
  router.push("/cases");
  setSidebarOpen(true);
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
      {/* ☰ Sidebar Toggle */}
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

      {/* Breadcrumb */}
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
        <Separator />

        <span style={{ color: CASE_GREEN, fontWeight: 600 }}>
          {CASE_MODE_LABEL[viewMode]}
        </span>
      </div>
    </div>
  );
}

/* -------------------------
 * styles
 * ------------------------- */
const linkStyle: React.CSSProperties = {
  cursor: "pointer",
  textDecoration: "underline",
};

function Separator() {
  return <span style={{ color: "#9ca3af" }}>/</span>;
}

/* ======================================================
 * Shell
 * ====================================================== */
function Shell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useCaseUI();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {sidebarOpen && <CaseSidebar />}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <CasesTopBar />
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
      </main>
    </div>
  );
}

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <CaseUIProvider initialCaseId={null}>
      <Suspense fallback={null}>
        <Shell>{children}</Shell>
      </Suspense>
    </CaseUIProvider>
  );
}
//law-frontend/app/law/layout.tsx
"use client";

import React from "react";
import { LawUIProvider, useLawUI } from "./LawUIContext";
import { useRouter } from "next/navigation";

const LAW_NAVY = "#1f3a8a";

/* ======================================================
 * Sidebar
 * ====================================================== */
function Sidebar() {
  const router = useRouter();

  const {
    sidebarOpen,
    setSidebarOpen,
    snapshot,
    chapters,
    currentChapter,
    setCurrentChapter,
    viewOptions,
    setViewOptions,
    graphMode,
    setGraphMode,
    asOfDate,
    setAsOfDate,
    articleQuery,
    setArticleQuery,
    setSelectedArticleRef,

  } = useLawUI();

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
       * 기준 시점
       * ======================= */}
      <section>
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
          기준 시점
        </p>

        <div style={{ fontSize: 14, marginBottom: 6 }}>현행법</div>

        <details>
          <summary
            style={{
              fontSize: 13,
              color: LAW_NAVY,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            특정 시점 조회
          </summary>

          <div style={{ marginTop: 6 }}>
            <input
              type="text"
              placeholder="YYYYMMDD"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              style={{
                width: "100%",
                fontSize: 14,
                padding: "8px 10px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
              }}
            />
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            20.12.22 이후 부터 가능, 현행법은 화면 새로고침
            </div>
          </div>
        </details>
      </section>

      {/* =======================
       * 그래프 종류
       * ======================= */}
      <section>
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
          그래프 종류
        </p>

        {[
          ["STRUCTURE", "법령 구조 (3단)"],
          ["FLOW", "법령 통합 사고"],
          ["SEMANTIC", "법령 해석 포인트"],
          ["REASONING", "법령 검토 방법"],
        ].map(([mode, label]) => (
          <label
            key={mode}
            style={{ display: "block", fontSize: 14, marginBottom: 6 }}
          >
            <input
              type="radio"
              name="graphMode"
              checked={graphMode === (mode as any)}
              onChange={() => setGraphMode(mode as any)}
            />{" "}
            {label}
          </label>
        ))}
      </section>

      {/* =======================
      * 🔹 조문 조회
      * ======================= */}
      <section>
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>조문 조회</p>

        <input
          value={articleQuery}
          onChange={(e) => setArticleQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const q = articleQuery.trim();
            if (!q) return;

            // 새 검색이면 선택 조문 초기화
            setSelectedArticleRef(null);

            // ✅ 라우팅 금지. 화면모드만 전환.
            setGraphMode("ARTICLE");
          }}
          placeholder="예: 65, 65의2"
          style={{
            width: "100%",
            fontSize: 14,
            padding: "8px 10px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            background: "#fff",
          }}
        />

        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
          엔터로 조회합니다.
        </div>
      </section>



      {/* =======================
       * Chapter
       * ======================= */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
          Chapter
        </p>

        {!snapshot && (
          <div style={{ fontSize: 13, color: "#6b7280" }}>snapshot 로딩 중…</div>
        )}

        {snapshot && chapters.length === 0 && (
          <div style={{ fontSize: 13, color: "#6b7280" }}>chapter 로딩 중…</div>
        )}

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 6 }}>
          {chapters.map((ch) => {
            const active = ch.chapter_id === currentChapter;

            return (
              <div
                key={ch.chapter_id}
                onClick={() => setCurrentChapter(ch.chapter_id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: active ? "#e0e7ff" : "#f9fafb",
                  border: active ? "1px solid #c7d2fe" : "1px solid #e5e7eb",
                  marginBottom: 6,
                  fontSize: 14,
                }}
                title={ch.title ?? ch.chapter_id}
              >
                {ch.title ?? ch.chapter_id}
              </div>
            );
          })}
        </div>
      </section>

      <hr style={{ borderTop: "1px solid #e5e7eb" }} />

      {/* =======================
       * 보기 옵션
       * ======================= */}
      <section>
        <p style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
          보기 옵션
        </p>

        <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
          <input
            type="checkbox"
            checked={viewOptions.showFlow}
            onChange={(e) =>
              setViewOptions({ ...viewOptions, showFlow: e.target.checked })
            }
          />{" "}
          사고 흐름
        </label>

        <label style={{ display: "block", fontSize: 14 }}>
          <input
            type="checkbox"
            checked={viewOptions.showArticle}
            onChange={(e) =>
              setViewOptions({ ...viewOptions, showArticle: e.target.checked })
            }
          />{" "}
          근거 조문
        </label>

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
      </section>
    </aside>
  );
}

/* ======================================================
 * TopBar (햄버거 + 브레드크럼)
 * ====================================================== */
function TopBar() {
  const router = useRouter();
  const {
    sidebarOpen,
    setSidebarOpen,
    graphMode,
    currentChapter,
    chapters,
    setGraphMode,
    setCurrentChapter,
    setSnapshot,
  } = useLawUI();

  const GRAPH_MODE_LABEL: Record<string, string> = {
    STRUCTURE: "법령 구조",
    FLOW: "법령 통합 사고",
    SEMANTIC: "법령 해석 포인트",
    REASONING: "법령 검토 방법",
    ARTICLE: "조문 조회",
  };

  const currentChapterTitle =
    chapters.find((c) => c.chapter_id === currentChapter)?.title ??
    currentChapter ??
    "";

  const goHome = () => {
    setGraphMode("STRUCTURE");
    setCurrentChapter(null);
    setSnapshot(null);
    router.push("/");
  };

  const goLawHome = () => {
    router.push("/law");
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
          background: LAW_NAVY,
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

        <span style={linkStyle} onClick={goLawHome}>
          법률
        </span>
        <Separator />

        <span>{GRAPH_MODE_LABEL[graphMode]}</span>
        <Separator />

        <span>통합 법령</span>

        {currentChapterTitle && graphMode !== "ARTICLE" && (
          <>
            <Separator />
            <span style={{ color: LAW_NAVY, fontWeight: 600 }}>
              {currentChapterTitle}
            </span>
          </>
        )}
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
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar />
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
      </main>
    </div>
  );
}

export default function LawLayout({ children }: { children: React.ReactNode }) {
  return (
    <LawUIProvider>
      <Shell>{children}</Shell>
    </LawUIProvider>
  );
}

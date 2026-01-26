// law-frontend/app/law/layout.tsx
"use client";

/**
 * Law Layout
 *
 * - LawUIProvider로 전체 law 영역 감싸기
 * - Sidebar + TopBar + Main Shell 구성
 * - feature 컴포넌트는 절대 여기서 직접 import하지 않음
 */

import React from "react";
import { useRouter } from "next/navigation";
import { LawUIProvider, useLawUI } from "./LawUIContext";

const LAW_NAVY = "#1f3a8a";

/* ======================================================
 * Sidebar
 * - law 탐색을 위한 모든 입력은 여기서만 발생
 * - 라우팅 대신 graphMode / context 상태만 변경
 * ====================================================== */
function Sidebar() {
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
    <aside style={styles.sidebar}>
      {/* =======================
       * 기준 시점
       * ======================= */}
      <section>
        <p style={styles.sectionTitle}>기준 시점</p>
        <div style={styles.subText}>현행법</div>

        <details>
          <summary style={styles.link}>특정 시점 조회</summary>

          <div style={{ marginTop: 6 }}>
            <input
              type="text"
              placeholder="YYYYMMDD"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              style={styles.input}
            />
            <div style={styles.hint}>
              21.03.16 이후부터 조회 가능, 현행법은 기본 값임
            </div>
          </div>
        </details>
      </section>

      {/* =======================
       * 그래프 종류
       * ======================= */}
      <section>
        <p style={styles.sectionTitle}>그래프 종류</p>

        {[
          ["STRUCTURE", "법령 구조 (3단)"],
          ["FLOW", "법령 통합 사고"],
          ["SEMANTIC", "법령 해석 포인트"],
          ["REASONING", "법령 검토 방법"],
        ].map(([mode, label]) => (
          <label key={mode} style={styles.radio}>
            <input
              type="radio"
              name="graphMode"
              checked={graphMode === mode}
              onChange={() => setGraphMode(mode as any)}
            />{" "}
            {label}
          </label>
        ))}
      </section>

      {/* =======================
       * 조문 조회
       * ======================= */}
      <section>
        <p style={styles.sectionTitle}>조문 조회</p>

        <input
          value={articleQuery}
          onChange={(e) => setArticleQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (!articleQuery.trim()) return;

            setSelectedArticleRef(null);
            setGraphMode("ARTICLE");
          }}
          placeholder="예: 65, 65의2"
          style={styles.input}
        />

        <div style={styles.hint}>엔터로 조회합니다.</div>
      </section>

      {/* =======================
       * Chapter 선택
       * ======================= */}
        <section style={styles.chapterSection}>
          <p style={styles.sectionTitle}>Chapter</p>
        {!snapshot && <div style={styles.hint}>snapshot 로딩 중…</div>}
        {snapshot && chapters.length === 0 && (
          <div style={styles.hint}>chapter 로딩 중…</div>
        )}

        <div style={styles.chapterScroll}>
          {chapters.map((ch) => {
            const active = ch.chapter_id === currentChapter;

            return (
              <div
                key={ch.chapter_id}
                onClick={() => setCurrentChapter(ch.chapter_id)}
                style={{
                  ...styles.chapterItem,
                  ...(active ? styles.chapterActive : {}),
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
        <p style={{ ...styles.sectionTitle, fontWeight: 800 }}>보기 옵션</p>

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={viewOptions.showFlow}
            onChange={(e) =>
              setViewOptions({ ...viewOptions, showFlow: e.target.checked })
            }
          />{" "}
          사고 흐름
        </label>

        <label style={styles.checkbox}>
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
          style={styles.closeButton}
        >
          사이드바 닫기
        </button>
      </section>
    </aside>
  );
}

/* ======================================================
 * TopBar
 * - breadcrumb + sidebar toggle
 * ====================================================== */
function TopBar() {
  const router = useRouter();

  const {
    sidebarOpen,
    setSidebarOpen,

    graphMode,
    currentChapter,
    chapters,

    setSelectedArticleRef,
    setArticleQuery,

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
    router.push("/enter");
  };

  const goLawHome = () => {
    setGraphMode("STRUCTURE");
    setSidebarOpen(true);
  };

  return (
    <header style={styles.topbar}>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={styles.menuButton}
        title="메뉴"
      >
        ☰
      </button>

      <nav style={styles.breadcrumb}>
        <span style={styles.link} onClick={goHome}>
          홈
        </span>
        <Separator />

        <span style={styles.link} onClick={goLawHome}>
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
      </nav>
    </header>
  );
}

/* ======================================================
 * Shell
 * ====================================================== */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.shell}>
      <Sidebar />
      <main style={styles.main}>
        <TopBar />
        <div style={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

/* ======================================================
 * Layout Entry
 * ====================================================== */
export default function LawLayout({ children }: { children: React.ReactNode }) {
  return (
    <LawUIProvider>
      <Shell>{children}</Shell>
    </LawUIProvider>
  );
}

/* ======================================================
 * Styles
 * ====================================================== */
const styles: Record<string, React.CSSProperties> = {

  shell: {
  display: "flex",
  minHeight: "100vh",     // 🔑 height 말고 minHeight
  backgroundColor: "#f5f6f8",
  },

  chapterSection: {
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  },

  chapterScroll: {
  flex: 1,
  overflowY: "auto",
  paddingRight: 6,
  },

  main: {
  flex: 1,
  display: "flex",
  flexDirection: "column",
},

  
sidebar: {
  width: 280,
  minWidth: 280,
  backgroundColor: "#fafafa",
  borderRight: "1px solid #e5e7eb",
  padding: "16px 14px",

  position: "sticky",   // 🔑 이게 핵심
  top: 0,
  alignSelf: "flex-start",

  height: "100vh",      // viewport 기준 고정
  display: "flex",
  flexDirection: "column",
  gap: 10,
},

  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    fontSize: 14,
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    background: "#fff",
  },
  hint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  link: {
    fontSize: 13,
    color: LAW_NAVY,
    cursor: "pointer",
    userSelect: "none",
    textDecoration: "underline",
  },
  radio: {
    display: "block",
    fontSize: 14,
    marginBottom: 6,
  },
  checkbox: {
    display: "block",
    fontSize: 14,
    marginBottom: 6,
  },
  chapterItem: {
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    marginBottom: 6,
    fontSize: 14,
  },
  chapterActive: {
    background: "#e0e7ff",
    border: "1px solid #c7d2fe",
  },
  closeButton: {
    marginTop: 10,
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  },
  menuButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: LAW_NAVY,
    color: "#fff",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 700,
  },
  breadcrumb: {
    fontSize: 14,
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  },
  content: {
  flex: 1,
  minHeight: 0,
},
};

function Separator() {
  return <span style={{ color: "#9ca3af" }}>/</span>;
}

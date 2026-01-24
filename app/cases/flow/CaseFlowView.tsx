// app/cases/flow/CaseFlowView.tsx
"use client";

import { useState } from "react";
import { CaseFlowPreviewBlock } from "./CaseFlowPreviewBlock";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";

type Props = {
  data: any;
  onOpenMenu: () => void;
};

export function CaseFlowView({ data, onOpenMenu }: Props) {
  const [showAppendix, setShowAppendix] = useState(false);
  const { userId } = useAuth();
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

const handleSaveCurrent = () => {
  if (!userId) return;

  saveThought({
    targetType: "case",

    // 🔥 “사건 요지(flow 요약)”를 저장
    targetId: `${data.meta.number} :: ${data.summary.what}`,

    // 🔥 사건 자체는 컨텍스트
    parentType: "case",
    parentId: data.meta.number,
  });
};


  return (
    <main style={styles.container}>
    <div style={{ position: "fixed", right: 24, bottom: 160, zIndex: 60 }}>
    {showHint && (
      <div
        style={{
          position: "absolute",
          bottom: 54,
          right: 0,
          padding: "6px 10px",
          borderRadius: 6,
          background: "#111827",
          color: "#ffffff",
          fontSize: 12,
          whiteSpace: "nowrap",
          boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        }}
      >
        저장
      </div>
    )}

    <button
      onClick={handleSaveCurrent}
      onMouseEnter={(e) => {
        setShowHint(true);
        e.currentTarget.style.background = "#fffbeb";
        e.currentTarget.style.borderColor = "#f59e0b";
        e.currentTarget.style.transform = "scale(1.06)";
        e.currentTarget.style.boxShadow =
          "0 6px 14px rgba(245,158,11,0.25)";
      }}
      onMouseLeave={(e) => {
        setShowHint(false);
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow =
          "0 4px 10px rgba(0,0,0,0.08)";
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
  </div>

      <h1 style={styles.title}>판례 핵심 흐름 요약</h1>

      {/* 메타데이터 */}
      <section style={styles.metaBox}>
        <div style={styles.metaGrid}>
          <div>
            <strong style={styles.metaLabel}>사건명</strong>
            {data.meta.title}
          </div>
          <div>
            <strong style={styles.metaLabel}>사건번호</strong>
            {data.meta.number}
          </div>
          <div>
            <strong style={styles.metaLabel}>법원</strong>
            {data.meta.court}
          </div>
          <div>
            <strong style={styles.metaLabel}>결론</strong>
            <span style={styles.conclusion}>{data.meta.conclusion}</span>
          </div>

          <div>
            <strong style={styles.metaLabel}>핵심 키워드</strong>
            <div style={styles.issueTags}>
              {data.meta.keyIssues?.map((issue: string, i: number) => (
                <span key={i} style={styles.issueTag}>
                  #{issue}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 요약 */}
      <section style={styles.resultBox}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🧭 사건 요지</h2>
          <p style={styles.text}>{data.summary.what}</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>⚖️ 핵심 쟁점</h2>
          {data.summary.points?.map((p: string, i: number) => (
            <p key={i} style={styles.bulletText}>• {p}</p>
          ))}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🧠 한 줄 결론</h2>
          <p style={styles.text}>{data.summary.takeaway}</p>
        </section>
      </section>

      <button
        style={styles.appendixToggle}
        onClick={() => setShowAppendix((v) => !v)}
      >
        {showAppendix ? "▲ 심화 분석 숨기기" : "▼ 더 깊은 분석 보기"}
      </button>

      {showAppendix && (
        <section style={styles.appendixBox}>
          <h3 style={styles.appendixTitle}>📎 심화 분석 자료</h3>

          <CaseFlowPreviewBlock
            title="📌 사실관계 요약"
            text={data.appendix.facts}
          />
          <CaseFlowPreviewBlock
            title="🧑‍⚖️ 원고 주장"
            text={data.appendix.plaintiff.join(" ")}
          />
          <CaseFlowPreviewBlock
            title="🏛️ 피고 주장"
            text={data.appendix.defendant.join(" ")}
          />
          <CaseFlowPreviewBlock
            title="⚖️ 법원의 판단"
            text={data.appendix.court.join(" ")}
          />
          <CaseFlowPreviewBlock
            title="📚 관련 법령 · 법리"
            text={data.appendix.law.join(" ")}
          />
        </section>
      )}

      <button style={styles.backButton} onClick={onOpenMenu}>
        ← 메뉴로 돌아가기
      </button>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "80vh",
    padding: "36px 24px",
    backgroundColor: "#f5f6f8",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  title: {
    fontSize: "32px",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "28px",
  },
  metaBox: {
    width: "100%",
    maxWidth: "720px",
    padding: "28px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "22px",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    fontSize: "14px",
    color: "#374151",
  },
  metaLabel: {
    display: "block",
    marginBottom: 4,
    fontWeight: 600,
  },
  conclusion: {
    color: "#059669",
    fontWeight: 600,
  },
  issueTags: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    marginTop: "6px",
  },
  issueTag: {
    fontSize: "12px",
    padding: "6px 10px",
    borderRadius: "999px",
    backgroundColor: "#ecfdf5",
    color: "#065f46",
  },
  resultBox: {
    width: "100%",
    maxWidth: "720px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "28px",
  },
  section: {
    marginBottom: "22px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: "10px",
  },
  text: {
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#374151",
  },
  bulletText: {
    fontSize: "14px",
    color: "#374151",
    marginBottom: "8px",
  },
  appendixToggle: {
    marginTop: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  },
  appendixBox: {
    width: "100%",
    maxWidth: "720px",
    marginTop: "24px",
    padding: "24px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    border: "1px dashed #e5e7eb",
  },
  appendixTitle: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "16px",
  },
  backButton: {
    marginTop: "16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  },
};

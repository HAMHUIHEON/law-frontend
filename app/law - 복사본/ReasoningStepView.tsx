// law-frontend/app/law/ReasoningStepView.tsx
"use client";

import { useEffect, useState } from "react";
import { useLawUI } from "./LawUIContext";


/* =========================
 * Types (Reasoning 전용)
 * ========================= */

type ReasoningStep = {
  step_id: string;
  step_type?: string;
  description?: string;
  based_on?: string[];
  conditions?: string[];
  effects?: string[];
  exceptions?: string[];
  methods?: string[];
};

type ReasoningIssue = {
  issue_title: string;
  summary?: string;
  steps: ReasoningStep[];
};

type ReasoningChapterPayload = {
  chapter_id?: string;
  chapter_name?: string;
  reasoning?: ReasoningIssue[];
};

type Props = {
  snapshot: { set_key: string } | null;
  currentChapter: string | null;
};

const STEP_TYPE_KO: Record<string, string> = {
  condition_check: "적용 요건",
  apply_rule: "규정 적용",
  exception_check: "예외 조건",
  priority_order: "적용 우선 순위",
  method_apply: "산식 / 절차",
};

function normalizeReasoningTitle(raw: string): string {
  return raw
    .replace(/\[[^\]]+]/g, "")   // [핵심 쟁점] 같은 태그 제거
    .replace(/\s+/g, " ")        // 줄바꿈/다중 공백 → 공백 하나
    .trim();
}

/* =========================
 * Component
 * ========================= */

export default function ReasoningView({ snapshot, currentChapter }: Props) {
  const [data, setData] = useState<ReasoningChapterPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssueTitle, setSelectedIssueTitle] = useState<string | null>(null);

  const [issueIndex, setIssueIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const { selectedIssueId } = useLawUI();

  useEffect(() => {
    if (!snapshot?.set_key || !currentChapter) return;

    setLoading(true);

    fetch(
      `http://127.0.0.1:8000/api/law/chapters/${currentChapter}/reasoning?set_key=${snapshot.set_key}`
    )
      .then((res) => res.json())
      .then((json: ReasoningChapterPayload) => {
        console.log("REASONING API PAYLOAD", json);
        setData(json);
        // setIssueIndex(0);
        setStepIndex(0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [snapshot?.set_key, currentChapter]);

    useEffect(() => {
      if (!data?.reasoning || !selectedIssueId) return;

      const idx = data.reasoning.findIndex(
        (i) =>
          normalizeReasoningTitle(i.issue_title) ===
          normalizeReasoningTitle(selectedIssueId)
      );

      if (idx >= 0) {
        setIssueIndex(idx);
        setStepIndex(0);
      }
    }, [data, selectedIssueId]);



  // ✅ 이슈 바뀌면 단계는 항상 0번부터
  useEffect(() => {
    setStepIndex(0);
  }, [issueIndex]);

  if (loading) return <p style={{ padding: 32 }}>불러오는 중…</p>;
  if (!data) return <p style={{ padding: 32 }}>검토 단계를 불러오지 못했어요.</p>;

  const issues = data.reasoning ?? [];

  const safeIssueIndex =
    issueIndex >= 0 && issueIndex < issues.length ? issueIndex : 0;

  const currentIssue = issues[safeIssueIndex] ?? issues[0] ?? null;
  const currentStep = currentIssue?.steps?.[stepIndex] ?? null;


  return (
    <main style={styles.container}>
      <div style={styles.pageFrame}>

        {/* ===== Summary (Issue 기준) ===== */}
        <section style={styles.summaryBox}>
          <h1 style={styles.title}>{currentIssue?.issue_title}</h1>
          {currentIssue?.summary && (
            <p style={styles.issueSummary}>{currentIssue.summary}</p>
          )}
        </section>

        
        {/* ===== Issue Tabs ===== */}
        <nav style={styles.issueTabBar}
          className="issue-tab-scroll">
          {issues.map((issue, idx) => (
            <button
              key={idx}
              onClick={() => setIssueIndex(idx)}
              style={{
                ...styles.issueTab,
                ...(idx === issueIndex ? styles.issueTabActive : {}),
              }}
            >
              {issue.issue_title}
            </button>
          ))}
        </nav>

        {/* ===== Step Layout ===== */}
        <div style={styles.layout}>
          {/* Step List */}
          <aside style={styles.stepList}>
            {currentIssue.steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setStepIndex(idx)}
                style={{
                  ...styles.stepButton,
                  ...(idx === stepIndex ? styles.stepActive : {}),
                }}
              >
                <div>
                  단계 {step.step_id}
                  {step.step_type && (
                    <span style={styles.stepTypeInline}>
                      · {STEP_TYPE_KO[step.step_type] ?? step.step_type}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </aside>

          {/* Step Detail */}
          <section style={styles.issueDetail}  className="ui-scroll">
            {currentStep && (
              <>
                <h2 style={styles.stepTitle}>
                  단계 {currentStep.step_id}
                  {currentStep.step_type && (
                    <span style={styles.stepType}>
                      · {STEP_TYPE_KO[currentStep.step_type] ?? currentStep.step_type}
                    </span>
                  )}
                </h2>

                {currentStep.description && (
                  <p style={styles.blockText}>{currentStep.description}</p>
                )}

                <MiniBlock title="🧷 기준 요건" items={currentStep.conditions} />
                <MiniBlock title="⚖️ 적용 효과" items={currentStep.effects} />
                <MiniBlock title="🚧 예외 조건" items={currentStep.exceptions} />
                <MiniBlock title="🧮 산식 · 절차" items={currentStep.methods} />
                <MiniBlock title="📖 근거 조문" items={currentStep.based_on} />
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================
 * MiniBlock (재사용)
 * ========================= */

function MiniBlock({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <p style={styles.miniTitle}>{title}</p>
      {items.map((t, i) => (
        <p key={i} style={styles.blockText}>{t}</p>
      ))}
    </div>
  );
}

/* =========================
 * styles
 * ========================= */

const styles = {
  container: {
    padding: "10px 10px",
    backgroundColor: "#f5f6f8",
    minHeight: "100vh",
  },

  pageFrame: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 24px",
  },

  title: {
    fontSize: "22px",
    fontWeight: 600,
    marginBottom: 12,
  },

  summaryBox: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: 20,
  },

  issueSummary: {
    fontSize: "14px",
    lineHeight: 1.8,
    color: "#374151",
  },

  issueTabBar: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
    overflowX: "auto" as const,
    padding: "1px 6px 6px 6px", // 👈 아래만 여유
  },

  issueTab: {
    padding: "8px 14px",
    fontSize: "13px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    marginbottom: 12,
  },

  issueTabActive: {
    backgroundColor: "#eef2ff",
    border: "#c7d2fe",
    color: "#1e3a8a",
    fontWeight: 600,
  },

  layout: {
    display: "flex",
    gap: 12,
  },

  stepList: {
    width: 180,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: 12,
    maxHeight: "65vh",
    overflowY: "auto" as const,
  },

  stepButton: {
    width: "100%",
    textAlign: "left" as const,
    padding: "10px 12px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "13px",
    color: "#374151",
  },

  stepActive: {
    backgroundColor: "#eef2ff",
    color: "#1e3a8a",
    fontWeight: 500,
  },

  stepTypeInline: {
    marginLeft: 4,
    fontSize: "12px",
    color: "#1e3a8a",
    fontWeight: 500,
  },

  issueDetail: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: 24,
    maxHeight: "65vh",
    overflowY: "auto" as const,
  },

  stepTitle: {
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: 12,
  },

  stepType: {
    marginLeft: 6,
    fontSize: "13px",
    fontWeight: 500,
    color: "#1e3a8a",
  },

  blockText: {
    fontSize: "13.5px",
    lineHeight: 1.7,
    marginBottom: 2,
    color: "#374151",
    whiteSpace: "pre-wrap" as const,
  },

  miniTitle: {
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: 6,
    color: "#111827",
  },
};

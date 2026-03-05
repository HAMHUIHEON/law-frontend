// law-frontend/app/law/features/reasoning/ReasoningStepView.tsx
"use client";

/**
 * ReasoningStepView
 *
 * - Chapter 단위 법령 검토 흐름을 Issue → Step → Detail 구조로 표현
 * - Flow / Semantic에서 선택된 issueId와 자동 동기화
 * - hover / active 스타일은 JSX에서만 제어 (TS 안전)
 */

import { useEffect, useState } from "react";
import { useLawUI } from "../../LawUIContext";
import { useAuth } from "@clerk/nextjs";
import { useRecordThoughtTrace } from "@/app/actions/useRecordThoughtTrace";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getLawAccess } from "../../access";
import { useRouter } from "next/navigation";

/* ======================================================
 * Types
 * ====================================================== */

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

/* ======================================================
 * Constants
 * ====================================================== */

const STEP_TYPE_LABEL: Record<string, string> = {
  condition_check: "적용 요건",
  apply_rule: "규정 적용",
  exception_check: "예외 조건",
  priority_order: "적용 우선 순위",
  method_apply: "산식 · 절차",
};

function normalizeTitle(raw: string) {
  return raw.replace(/\[[^\]]+]/g, "").replace(/\s+/g, " ").trim();
}

/* ======================================================
 * Component
 * ====================================================== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export default function ReasoningStepView({ snapshot, currentChapter }: Props) {
  /* ----------------------------
   * Global Sync
   * ---------------------------- */
  const { userId } = useAuth();
  const { selectedIssueId } = useLawUI();
  const saveThought = useSaveThought();
  const [showHint, setShowHint] = useState(false);

  const userAccess = useUserAccessLevel();
  const access = getLawAccess(userAccess, "REASONING"); 
  const isLocked = access !== "FULL";
  const router = useRouter();



  const handleSaveCurrent = () => {
    if (!userId) return;
    if (!snapshot?.set_key) return;
    if (!currentChapter) return;
    if (!currentIssue || !currentStep) return;

    saveThought({
      targetType: "law",
      targetId: `${currentIssue.issue_title}:${currentStep.step_id}`,
      parentType: "law",
      parentId: snapshot.set_key,
    });
  };

  /* ----------------------------
   * Local State
   * ---------------------------- */
  const [data, setData] = useState<ReasoningChapterPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const [issueIndex, setIssueIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  /* ----------------------------
   * Effect ①: 데이터 로드
   * ---------------------------- */
  useEffect(() => {
    if (!snapshot?.set_key || !currentChapter) return;

    setLoading(true);

    fetch(
      `${API_BASE}/api/law/chapters/${currentChapter}/reasoning?set_key=${snapshot.set_key}`
    )
      .then((res) => res.json())
      .then((json: ReasoningChapterPayload) => {
        setData(json);
        setIssueIndex(0);
        setStepIndex(0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [snapshot?.set_key, currentChapter]);

  /* ----------------------------
   * Effect ②: 외부 issueId 동기화
   * ---------------------------- */
  useEffect(() => {
    if (!data?.reasoning || !selectedIssueId) return;

    const idx = data.reasoning.findIndex(
      (i) =>
        normalizeTitle(i.issue_title) ===
        normalizeTitle(selectedIssueId)
    );

    if (idx >= 0) {
      setIssueIndex(idx);
      setStepIndex(0);
    }
  }, [data, selectedIssueId]);

  /* ----------------------------
   * Effect ③: Issue 변경 시 Step 초기화
   * ---------------------------- */
  useEffect(() => {
    setStepIndex(0);
  }, [issueIndex]);

    // ✅ SAFE DERIVED (early return 이전에도 항상 계산 가능해야 함)
  const issues = data?.reasoning ?? [];
  const currentIssue = issues[issueIndex] ?? null;
  const currentStep = currentIssue?.steps?.[stepIndex] ?? null;

  useRecordThoughtTrace({
    userId,
    parentType: "law",
    parentId: currentChapter ?? "",
    traceType: "reasoning",
    traceId:
      selectedIssueId && currentStep?.step_id
        ? `${selectedIssueId}:${currentStep.step_id}`
        : "",
  });

  /* ----------------------------
   * Derived Data
   * ---------------------------- */
  if (loading) return <p style={{ padding: 32 }}>불러오는 중…</p>;
  if (!data) return <p style={{ padding: 32 }}>검토 단계를 불러오지 못했어요.</p>;

  /* ======================================================
   * Render
   * ====================================================== */

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

  <div style={styles.pageFrame}>

    {/* Issue Summary */}
    <section style={styles.summaryBox}>
      <h1 style={styles.title}>{currentIssue?.issue_title}</h1>
      {currentIssue?.summary && (
        <p style={styles.issueSummary}>{currentIssue.summary}</p>
      )}
    </section>

    {/* 🔹 STEP TABS (상단, 전체 폭) */}
    <nav style={styles.stepTabs} className="issue-tab-scroll">
      {currentIssue?.steps.map((step, idx) => (
        <button
          key={idx}
          onClick={() => setStepIndex(idx)}
          style={{
            ...styles.stepTab,
            ...(idx === stepIndex ? styles.stepTabActive : {}),
          }}
        >
          단계 {step.step_id}
          {step.step_type && (
            <span style={styles.stepTypeInline}>
              · {STEP_TYPE_LABEL[step.step_type] ?? step.step_type}
            </span>
          )}
        </button>
      ))}
    </nav>

    {/* 🔹 MAIN ROW (좌우 정확히 같은 높이 기준) */}
    <div style={styles.mainRow}>

      {/* LEFT: ISSUE LIST */}
      <aside style={styles.issueList} className="ui-scroll">
        {issues.map((issue, idx) => {
          const active = idx === issueIndex;
          return (
            <button
              key={idx}
              onClick={() => setIssueIndex(idx)}
              style={{
                ...styles.issueButton,
                ...(active ? styles.issueActive : {}),
              }}
            >
              {issue.issue_title}
            </button>
          );
        })}
      </aside>

      {/* RIGHT: STEP DETAIL */}
        <section
          style={{
            ...styles.stepDetail,
            position: "relative",
          }}
          className="ui-scroll"
        >
          {/* 🔹 내용 레이어 */}
          <div
            style={{
              filter: isLocked ? "blur(6px)" : "none",
              pointerEvents: isLocked ? "none" : "auto",
              userSelect: isLocked ? "none" : "auto",
            }}
          >
            {currentStep && (
              <>
                <h2 style={styles.stepTitle}>
                  단계 {currentStep.step_id}
                  {currentStep.step_type && (
                    <span style={styles.stepType}>
                      · {STEP_TYPE_LABEL[currentStep.step_type] ?? currentStep.step_type}
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
                {/* 🔗 Law → Case bridge */}
                <div style={styles.caseBridge}>
                  <p style={styles.caseBridgeText}>
                    이 논증이 실제 판례에서 어떻게 적용되는지 확인해보세요.
                  </p>

                  <button
                    style={styles.caseBridgeButton}
                    onClick={() => router.push("/cases")}
                  >
                    판례 분석 보러가기 →
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* 🔒 잠금 오버레이 */}
          {isLocked && (
            <div style={lockOverlayStyle}>
              <p style={{ fontSize: 14, fontWeight: 600, textAlign: "center" }}>
                이 법령 검토 단계는
                <br />
                <strong>유료 멤버쉽 가입 후 전체 확인할 수 있습니다</strong>
              </p>
              <button
                style={ctaButtonStyle}
                onClick={() => router.push("/me/subscribe?from=law")}
              >
                유료 멤버쉽 가입하기
              </button>
            </div>
          )}
        </section>

    </div>
  </div>
</main>
  );
}

/* ======================================================
 * Sub Components
 * ====================================================== */

function MiniBlock({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <section style={{ marginTop: 18 }}>
      <p style={styles.miniTitle}>{title}</p>
      {items.map((t, i) => (
        <p key={i} style={styles.blockText}>
          {t}
        </p>
      ))}
    </section>
  );
}

/* ======================================================
 * Styles (SemanticView 톤과 통일)
 * ====================================================== */

const lockOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(2px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  zIndex: 10,
};

const ctaButtonStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  fontSize: 13,
  cursor: "pointer",
};

const styles = {
  /* ================= Layout ================= */

  container: {
    padding: "16px 0",
    backgroundColor: "#f5f6f8",
  },

  pageFrame: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
  },

  mainRow: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: 16,
    alignItems: "stretch", // 🔥 키높이 기준 통일
  },

  /* ================= Summary ================= */

  summaryBox: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  title: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 20,
  },

  issueSummary: {
    fontSize: 14,
    lineHeight: 1.8,
    color: "#374151",
  },

  /* ================= Step Tabs ================= */

stepTabs: {
  display: "flex",
  flexWrap: "nowrap" as const,   // 🔥 절대 줄바꿈 금지
  overflowX: "auto" as const,    // 🔥 가로 스크롤
  overflowY: "hidden" as const,
  gap: 8,
  marginBottom: 16,
  paddingBottom: 6,              // 스크롤바 공간
  minWidth: 0,                   // 🔥 부모 flex/grid 안에서 오버플로우 허용
},
  /* ================= Step Tab ================= */

  stepTab: {
    flex: "0 0 auto", 
    padding: "8px 14px",
    fontSize: 13,
    borderRadius: 999,

    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",

    backgroundColor: "#ffffff",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },


  stepTabActive: {
    backgroundColor: "#eef2ff",
    borderColor: "#c7d2fe",
    color: "#1e3a8a",
    fontWeight: 600,
  },

  stepTypeInline: {
    marginLeft: 4,
    fontSize: 12,
    color: "#1e3a8a",
    fontWeight: 500,
  },

  /* ================= Issue List ================= */

  issueList: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: 12,
    maxHeight: "70vh",
    overflowY: "auto" as const,
  },

  issueButton: {
    marginTop: 12,
    width: "100%",
    textAlign: "left" as const,
    padding: "6px 12px",
    fontSize: 13.5,
    borderRadius: 8,

    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent", // ✅ 항상 유지

    backgroundColor: "transparent",
    cursor: "pointer",
    color: "#374151",
  },

  issueActive: {
    backgroundColor: "#eef2ff",
    color: "#1e3a8a",
    fontWeight: 500,
  },

  /* ================= Step Detail ================= */

  stepDetail: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: 24,
    maxHeight: "70vh",
    overflowY: "auto" as const,
  },

  stepTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 12,
  },

  stepType: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: 500,
    color: "#1e3a8a",
  },

  /* ================= Text Blocks ================= */

  blockText: {
    fontSize: 13.5,
    lineHeight: 1.7,
    color: "#374151",
    whiteSpace: "pre-wrap" as const,
  },

  miniTitle: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    color: "#111827",
  },
  caseBridge: {
  marginTop: 26,
  paddingTop: 18,
  borderTop: "1px solid #e5e7eb",
},

caseBridgeText: {
  fontSize: 13.5,
  color: "#374151",
  marginBottom: 10,
},

caseBridgeButton: {
  padding: "8px 12px",
  fontSize: 13,
  borderRadius: 8,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
},
};

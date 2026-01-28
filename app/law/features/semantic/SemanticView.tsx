// law-frontend/app/law/semantic/SemanticView.tsx
"use client";

/**
 * SemanticView
 *
 * - 선택된 Chapter의 semantic issue 목록을 로드
 * - Issue 단위로 조건 / 효과 / 방법 / 예외를 구조화해 표시
 * - Flow / Reasoning에서 선택된 issueId와 동기화됨
 */

import React, { useEffect, useMemo, useState } from "react";
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

type CrossRef = {
  type?: string;
  target?: string;
  note?: string;
};

type SemanticIssue = {
  issue_id: string;
  issue_title: string;
  issue_summary?: string;
  conditions: string[];
  effects: string[];
  methods: string[];
  exceptions: string[];
  cross_refs: CrossRef[];
};

type SemanticChapterPayload = {
  chapter_id?: string;
  chapter_name?: string;
  chapter_summary?: string;
  issues?: SemanticIssue[];
};

type Props = {
  snapshot: { set_key: string } | null;
  currentChapter: string | null;
};

/* ======================================================
 * Component
 * ====================================================== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export default function SemanticView({ snapshot, currentChapter }: Props) {
  const { userId } = useAuth();
  const { selectedIssueId } = useLawUI();
  const saveThought = useSaveThought();
  const [showHint, setShowHint] = useState(false);

  const userAccess = useUserAccessLevel();
  const access = getLawAccess(userAccess, "SEMANTIC"); // or "REASONING"
  const isLocked = access !== "FULL";
  const router = useRouter();
  
  const handleSaveCurrent = () => {
    if (!userId) return;
    if (!snapshot?.set_key) return;
    if (!currentChapter) return;
    if (!currentIssue) return;

    saveThought({
      targetType: "law",
      targetId: `${currentIssue.issue_id}:${currentIssue.issue_title}`,
      parentType: "law",
      parentId: snapshot.set_key,
    });
  };


  const [data, setData] = useState<SemanticChapterPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ “현재 화면에서 선택된 이슈”
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  /* ------------------------------------------------------
   * Effect ①: Flow/Reasoning에서 넘어온 selectedIssueId 동기화
   * ------------------------------------------------------ */
  useEffect(() => {
    if (!selectedIssueId) return;
    setSelectedIssue(selectedIssueId);
  }, [selectedIssueId]);

  /* ------------------------------------------------------
   * Effect ②: Semantic 데이터 로드 + “초기 선택” 결정
   * ------------------------------------------------------ */
  useEffect(() => {
    if (!snapshot?.set_key || !currentChapter) return;

    setLoading(true);

    fetch(
      `${API_BASE}/api/law/chapters/${currentChapter}/semantic?set_key=${snapshot.set_key}`
    )
      .then((res) => res.json())
      .then((json: SemanticChapterPayload) => {
        setData(json);

        const firstIssueId = json.issues?.[0]?.issue_id ?? null;

        // ✅ 선택 우선순위:
        // 1) 외부에서 지정된 selectedIssueId (Flow/Reasoning에서 클릭으로 들어온 경우)
        // 2) 기존에 로컬에서 선택해둔 selectedIssue (유저가 이 화면에서 클릭했던 것 유지)
        // 3) 첫 번째 이슈
        setSelectedIssue((prev) => selectedIssueId ?? prev ?? firstIssueId);

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [snapshot?.set_key, currentChapter, selectedIssueId]);

  /* ------------------------------------------------------
   * Derived
   * ------------------------------------------------------ */
  const issues = useMemo(() => data?.issues ?? [], [data]);

  const currentIssue = useMemo(() => {
    if (!selectedIssue) return null;
    return issues.find((i) => i.issue_id === selectedIssue) ?? null;
  }, [issues, selectedIssue]);

  useRecordThoughtTrace({
    userId,
    parentType: "law",
    parentId: currentChapter ?? "",
    traceType: "semantic",
    traceId: currentIssue
      ? `${currentIssue.issue_id}|${currentIssue.issue_title}`
      : "",
  });


  if (loading) return <p style={{ padding: 32 }}>불러오는 중…</p>;
  if (!data) return <p style={{ padding: 32 }}>시멘틱 데이터를 불러오지 못했어요.</p>;

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
        {/* =====================
         * Chapter Summary
         * ===================== */}
        <section style={styles.summaryBox}>
          <h1 style={styles.title}>{data.chapter_name ?? currentChapter}</h1>

          {data.chapter_summary && (
            <Summary
              text={data.chapter_summary}
              expanded={summaryExpanded}
              onToggle={() => setSummaryExpanded((v) => !v)}
            />
          )}
        </section>

        {/* =====================
         * Issue Layout
         * ===================== */}
        <div style={styles.layout}>
          {/* Issue List */}
          <aside style={styles.issueList} className="ui-scroll">
            {issues.map((issue) => {
              const active = issue.issue_id === selectedIssue;

              return (
                <button
                  key={`${currentChapter}-${issue.issue_id}`}
                  onClick={() => setSelectedIssue(issue.issue_id)}
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

          {/* Issue Detail */}
          <section
            style={{
              ...styles.issueDetail,
              position: "relative", // 🔥 오버레이 기준
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
          {/* ✅ 여기서 “빈 화면” 방지: currentIssue 없으면 안내문 */}
            {!currentIssue ? (
              <div style={styles.emptyPanel}>
                <div style={styles.emptyTitle}>이슈를 선택해 주세요</div>
                <div style={styles.emptyDesc}>
                  왼쪽 목록에서 이슈를 클릭하면 상세 내용이 표시됩니다.
                </div>
              </div>
            ) : (
              <>
                <h2 style={styles.issueTitle}>{currentIssue.issue_title}</h2>

                <Block title="🧩 전제 조건" items={currentIssue.conditions} />
                <Block title="⚖️ 법적 효과" items={currentIssue.effects} />
                <Block title="🧠 산정 방식" items={currentIssue.methods} />
                <Block title="🚫 예외 규정" items={currentIssue.exceptions} />
                <Block
                  title="📚 관련 규정" items={currentIssue.cross_refs}
                />
              </>
            )}
            </div>
              {/* 🔒 잠금 오버레이 */}
              {isLocked && (
                <div style={lockOverlayStyle}>
                  <p style={{ fontSize: 14, fontWeight: 600, textAlign: "center" }}>
                    이 법령 해석 단계는
                    <br />
                    <strong>구독 후 전체 확인할 수 있습니다</strong>
                  </p>
                  <button
                    style={ctaButtonStyle}
                    onClick={() => router.push("/me/subscribe?from=law")}
                  >
                    구독하고 전체 보기
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

function Summary({
  text,
  expanded,
  onToggle,
}: {
  text: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sentences = text
    .split(". ")
    .map((s) => s.trim())
    .filter(Boolean);

  const visible = expanded ? sentences : sentences.slice(0, 2);

  return (
    <div style={styles.summaryContent}>
      {visible.map((s, i) => (
        <p key={i} style={{ marginBottom: 2 }}>
          {s.endsWith(".") ? s : s + "."}
        </p>
      ))}

      {sentences.length > 2 && (
        <span style={styles.summaryToggle} onClick={onToggle}>
          {expanded ? "접기" : "더보기"}
        </span>
      )}
    </div>
  );
}

type BlockItem =
  | string
  | { target?: string; note?: string };

function Block({
  title,
  items,
}: {
  title: string;
  items: BlockItem[];
}) {
  return (
    <section style={styles.block}>
      <h3 style={styles.blockTitle}>{title}</h3>

      {items.length === 0 ? (
        <p style={styles.empty}>내용 없음</p>
      ) : (
        items.map((item, i) => {
          if (typeof item === "string") {
            return (
              <p key={i} style={styles.blockText}>
                {item}
              </p>
            );
          }

          // ✅ target이 있을 때만 bold
          return (
            <p key={i} style={styles.blockText}>
              {item.target && (
                <strong style={styles.blockStrong}>
                  {item.target}
                </strong>
              )}
              {item.note && (
                <>
                  {item.target ? " — " : ""}
                  <span>{item.note}</span>
                </>
              )}
            </p>
          );
        })
      )}
    </section>
  );
}

/* ======================================================
 * Styles
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

const styles: Record<string, React.CSSProperties> = {
  /* ================= Page ================= */

  container: {
    padding: "16px 0",
    backgroundColor: "#f5f6f8",
  },

  pageFrame: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
  },

  title: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 20,
  },

  /* ================= Chapter Summary ================= */

  summaryBox: {
    marginBottom: 32,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  summaryContent: {
    fontSize: 14,
    lineHeight: 1.8,
    color: "#374151",
    maxWidth: 880,
  },

  summaryToggle: {
    display: "inline-block",
    marginTop: 6,
    color: "#1e3a8a",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },

  /* ================= Layout ================= */

  layout: {
    display: "flex",
    gap: 12,
  },

  /* ================= Issue List ================= */

  issueList: {
    width: 240,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: 12,
    maxHeight: "70vh",
    overflowY: "auto",
  },

  issueButton: {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 13.5,
    borderRadius: 8,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    color: "#374151",
  },

  issueActive: {
    backgroundColor: "#eef2ff",
    color: "#1e3a8a",
    fontWeight: 500,
  },

  /* ================= Issue Detail ================= */

  issueDetail: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: 24,
    maxHeight: "70vh",
    overflowY: "auto",
  },

  issueTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 20,
  },

  /* ================= Blocks ================= */

  block: {
    marginBottom: 24,
  },

  blockTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
  },

  blockText: {
    fontSize: 13,
    lineHeight: 1.8,
    marginBottom: 10,
    color: "#374151",
    whiteSpace: "pre-wrap",
  },

  blockStrong: {
    fontWeight: 500,
    color: "#111827",
  },

  empty: {
    fontSize: 13,
    color: "#9ca3af",
  },

  /* ================= Empty State ================= */

  emptyPanel: {
    border: "1px dashed #e5e7eb",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fafafa",
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 6,
    color: "#111827",
  },

  emptyDesc: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.6,
  },
};

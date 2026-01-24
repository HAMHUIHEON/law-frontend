// law-frontend/app/law/SemanticView.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLawUI } from "./LawUIContext";

/* =========================
 * Types (Semantic 전용)
 * ========================= */

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



/* =========================
 * Component
 * ========================= */

export default function SemanticView({ snapshot, currentChapter }: Props) {
  const [data, setData] = useState<SemanticChapterPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const router = useRouter();

  // ✅ 반드시 컴포넌트 최상단
  const { selectedIssueId } = useLawUI();

    // ✅ selectedIssueId → 초기 선택 동기화
    useEffect(() => {
      if (selectedIssueId) {
        setSelectedIssue(selectedIssueId);
      }
    }, [selectedIssueId]);
  
  
    useEffect(() => {
    if (!snapshot?.set_key || !currentChapter) return;

    setLoading(true);

    fetch(
      `http://127.0.0.1:8000/api/law/chapters/${currentChapter}/semantic?set_key=${snapshot.set_key}`
    )
      .then((res) => res.json())
      .then((json: SemanticChapterPayload) => {
        setData(json);
        if (!selectedIssueId) {
          const first = json.issues?.[0]?.issue_id ?? null;
          setSelectedIssue(first);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [snapshot?.set_key, currentChapter]);

  if (loading) return <p style={{ padding: 32 }}>불러오는 중…</p>;
  if (!data) return <p style={{ padding: 32 }}>시멘틱 데이터를 불러오지 못했어요.</p>;

  const issues = data.issues ?? [];
  const current =
    selectedIssue != null
      ? issues.find((i) => i.issue_id === selectedIssue) ?? null
      : null;

  return (
    <main style={styles.container}>
      <div style={styles.pageFrame}>

        {/* summary */}
        <section style={styles.summaryBox}>
          <h1 style={styles.title}>
            {data.chapter_name ?? currentChapter}
          </h1>

          {data.chapter_summary && (() => {
            const sentences = data.chapter_summary
              .split(". ")
              .map(s => s.trim())
              .filter(Boolean);

            const visible = summaryExpanded
              ? sentences
              : sentences.slice(0, 2);

            return (
              <div style={styles.summaryContent}>
                {visible.map((s, i) => (
                  <p key={i} style={{ marginBottom: 1.5 }}>
                    {s.endsWith(".") ? s : s + "."}
                  </p>
                ))}

                {sentences.length > 2 && (
                  <span
                    style={styles.summaryToggle}
                    onClick={() => setSummaryExpanded(v => !v)}
                  >
                    {summaryExpanded ? "접기" : "더보기"}
                  </span>
                )}
              </div>
            );
          })()}
        </section>


        {/* issue layout */}
        <div style={styles.layout}>
          <aside style={styles.issueList} className="ui-scroll">
            {issues.map((issue, index) => (
            <button
              key={`${currentChapter}-${issue.issue_id}-${index}`}
              style={{
                ...styles.issueButton,
                ...(issue.issue_id === selectedIssue ? styles.issueActive : {}),
              }}
              onClick={() => setSelectedIssue(issue.issue_id)}
            >
              {issue.issue_title}
            </button>
            ))}
          </aside>

          <section style={styles.issueDetail} className="ui-scroll">
            {current && (
              <>
                <h2 style={styles.issueTitle}>
                  {current.issue_title}
                </h2>

                <Block title="🧩 전제 조건" items={current.conditions} />
                <Block title="⚖️ 법적 효과" items={current.effects} />
                <Block title="🧠 산정 방식" items={current.methods} />
                <Block title="🚫 예외 규정" items={current.exceptions} />
                <Block
                  title="📚 관련 규정"
                  items={current.cross_refs.map(
                    (r) => `${r.target}${r.note ? " — " + r.note : ""}`
                  )}
                />
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================
 * Block (그대로 복사)
 * ========================= */

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <section style={styles.block}>
      <h3 style={styles.blockTitle}>{title}</h3>
      {items.length === 0 ? (
        <p style={styles.empty}>내용 없음</p>
      ) : (
        items.map((text, i) => (
          <p key={i} style={styles.blockText}>
            {text}
          </p>
        ))
      )}
    </section>
  );
}

/* =========================
 * styles (🔥 CaseIssuePage 그대로)
 * ========================= */

const styles = {
  container: {
    padding: "10px 10px",
    backgroundColor: "#f5f6f8",
    minHeight: "100vh",
  },

  title: {
    fontSize: "28px",
    fontWeight: 600,
    marginBottom: "20px",
  },

  summaryBox: {
    width: "100%",
    marginBottom: "32px",
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  layout: {
    display: "flex",
    gap: "12px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  issueList: {
    width: "240px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "12px",
    maxHeight: "70vh",
    overflowY: "auto" as const,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  issueButton: {
    width: "100%",
    textAlign: "left" as const,
    padding: "10px 12px",
    fontSize: "13.5px",
    fontWeight: 400, 
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    color: "#374151",
  },

issueActive: {
  backgroundColor: "#eef2ff", // 연한 블루
  color: "#1e3a8a",           // 진한 블루 텍스트
  fontWeight: 500,
},


  issueDetail: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    maxHeight: "70vh",
    overflowY: "auto" as const,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  issueTitle: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "20px",
  },

  block: {
    marginBottom: "24px",
  },

  blockTitle: {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "8px",
  },

  blockText: {
    fontSize: "13px",
    lineHeight: 1.8,
    marginBottom: "10px",
    color: "#374151",
    whiteSpace: "pre-wrap" as const,
    fontWeight: 400
  },

  empty: {
    fontSize: "13px",
    color: "#9ca3af",
  },

  breadcrumb: {
    fontSize: "12px",
    color: "#9ca3af",
    alignSelf: "flex-start",
    marginBottom: "16px",
    fontWeight: 400
  },

  link: {
    cursor: "pointer",
    textDecoration: "underline",
  },

  pageFrame: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
  },

  summaryContent: {
    fontSize: "14px",
    fontWeight: 400, 
    lineHeight: 1.8,
    color: "#374151",
    maxWidth: "880px",
  },

  summaryToggle: {
    display: "inline-block",
    marginTop: 6,
    color: "#1e3a8a",   // indigo-600
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },

};

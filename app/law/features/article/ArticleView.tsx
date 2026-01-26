// law-frontend/app/law/ArticleView.tsx
"use client";

/* ======================================================
 * Imports
 * ====================================================== */

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRecordThoughtTrace } from "@/app/actions/useRecordThoughtTrace";
import { useLawUI } from "../../LawUIContext";
import { useSaveThought } from "@/app/hooks/useSaveThought";


/* ======================================================
 * Types
 * ====================================================== */

type SubItem = { id: string; text: string };
type Item = { id: string; text: string; subitems?: SubItem[] };
type Paragraph = { id: string; text: string; items?: Item[] };

type NormUnit = {
  id: string;
  level: "PARA" | "ITEM" | "SUBITEM";
  roles?: string[];
  short_label?: string;
};

type ArticlePayload = {
  article_id: string;   // ART_65_2
  article_no: string;   // 65의2
  title?: string;
  paragraphs: Paragraph[];
  norm_units?: NormUnit[];
};

type SelectedArticleRef = {
  scope: "LAW" | "DECREE" | "RULE";
  law_name: string;
  version_key: string;
  article_id: string;
  title?: string;
};

type ResolveResult = {
  results: Array<{
    scope: "LAW" | "DECREE" | "RULE";
    law_name: string;
    version_key: string;
    matched: Array<{ article_id: string; title?: string }>;
  }>;
  errors?: any[];
};

type ReverseUsage = {
  scope: "LAW" | "DECREE" | "RULE";
  law_name: string;
  version_key: string;
  chapter_id: string;
  issue_title: string;
  step_id: string;
  step_type: string;
  description: string;
};

type ReverseLookupResponse = {
  article_id: string;
  set_key: string;
  count: number;
  usages: ReverseUsage[];
};

/* ======================================================
 * Utils
 * ====================================================== */

function labelScope(s: string) {
  return s === "LAW" ? "법률" : s === "DECREE" ? "시행령" : "시행규칙";
}

function articleIdToNo(articleId: string): string {
  const raw = articleId.replace(/^ART_/, "");
  const parts = raw.split("_");
  if (parts.length === 1) return parts[0];
  return `${parts[0]}의${parts[1]}`;
}

/* ======================================================
 * Main
 * ====================================================== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export default function ArticleReadView() {
  const { userId } = useAuth();
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);
  const handleSaveCurrent = () => {
    if (!userId) return;
    if (!selectedArticleRef?.article_id) return;
    if (!snapshot?.set_key) return;

    saveThought({
        targetType: "law",
        targetId: `${selectedArticleRef.scope}:${selectedArticleRef.article_id}`,
        parentType: "law",
        parentId: snapshot.set_key,
      });
    };

  const {
    snapshot,
    articleQuery,
    selectedArticleRef,
    setSelectedArticleRef,
    currentChapter,   // 👈 여기로 합쳐서 가져오면 됨

  } = useLawUI();

  const q = String(articleQuery ?? "").trim();
  const setKey = snapshot?.set_key ?? "";

  /* -------------------------
   * Resolve State
   * ------------------------- */
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveErr, setResolveErr] = useState<string | null>(null);
  const [resolveData, setResolveData] = useState<ResolveResult | null>(null);

  /* -------------------------
   * Read State
   * ------------------------- */
  const [readLoading, setReadLoading] = useState(false);
  const [readErr, setReadErr] = useState<string | null>(null);
  const [readData, setReadData] = useState<ArticlePayload | null>(null);

  /* -------------------------
   * Reverse State
   * ------------------------- */
  const [reverseLoading, setReverseLoading] = useState(false);
  const [reverseErr, setReverseErr] = useState<string | null>(null);
  const [reverseData, setReverseData] =
    useState<ReverseLookupResponse | null>(null);

  /* -------------------------
   * Resolve Fetch
   * ------------------------- */
  useEffect(() => {
    if (!setKey || !q) {
      setResolveData(null);
      setResolveErr(null);
      setResolveLoading(false);
      return;
    }

    const controller = new AbortController();
    setResolveLoading(true);
    setResolveErr(null);

    fetch(
      `${API_BASE}/api/law/articles/resolve?set_key=${encodeURIComponent(
        setKey
      )}&q=${encodeURIComponent(q)}`,
      { signal: controller.signal }
    )
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(text || `HTTP ${r.status}`);
        return JSON.parse(text);
      })
      .then((json: ResolveResult) => {
        const safeResults = Array.isArray(json?.results) ? json.results : [];
        setResolveData({ ...json, results: safeResults });
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        console.error(e);
        setResolveErr(String(e?.message ?? e));
        setResolveData(null);
      })
      .finally(() => setResolveLoading(false));

    return () => controller.abort();
  }, [setKey, q]);

  /* -------------------------
   * Read Fetch
   * ------------------------- */
  useEffect(() => {
    if (
      !selectedArticleRef?.law_name ||
      !selectedArticleRef?.version_key ||
      !selectedArticleRef?.article_id
    ) {
      setReadData(null);
      setReadErr(null);
      setReadLoading(false);
      return;
    }

    const controller = new AbortController();
    setReadLoading(true);
    setReadErr(null);
    setReadData(null);

    const url = `${API_BASE}/api/law/norm/article?law_name=${encodeURIComponent(
      selectedArticleRef.law_name
    )}&version_key=${encodeURIComponent(
      selectedArticleRef.version_key
    )}&article_id=${encodeURIComponent(selectedArticleRef.article_id)}`;

    fetch(url, { signal: controller.signal })
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(text || `HTTP ${r.status}`);
        return JSON.parse(text);
      })
      .then((payload) => {
        const art = payload?.article ?? {};
        const paragraphs = Array.isArray(payload?.paragraphs)
          ? payload.paragraphs
          : [];
        const norm_units = Array.isArray(payload?.norm_units)
          ? payload.norm_units
          : [];

        const id = String(art?.id ?? selectedArticleRef.article_id);

        setReadData({
          article_id: id,
          article_no: articleIdToNo(id),
          title: art?.title ? String(art.title) : selectedArticleRef.title,
          paragraphs,
          norm_units,
        });
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        console.error(e);
        setReadErr(String(e?.message ?? e));
        setReadData(null);
      })
      .finally(() => setReadLoading(false));

    return () => controller.abort();
  }, [
    selectedArticleRef?.law_name,
    selectedArticleRef?.version_key,
    selectedArticleRef?.article_id,
  ]);

  /* -------------------------
   * Memo
   * ------------------------- */
  const results = useMemo(() => {
    const arr = resolveData?.results;
    return Array.isArray(arr) ? arr : [];
  }, [resolveData]);

  /* -------------------------
   * Reverse Reset
   * ------------------------- */
  useEffect(() => {
    setReverseData(null);
    setReverseErr(null);
  }, [
    selectedArticleRef?.article_id,
    selectedArticleRef?.scope,
    selectedArticleRef?.law_name,
    selectedArticleRef?.version_key,
  ]);

  /* -------------------------
   * Reverse Fetch
   * ------------------------- */
  useEffect(() => {
    const article_id = selectedArticleRef?.article_id;
    const scope = selectedArticleRef?.scope;
    const law_name = selectedArticleRef?.law_name;
    const version_key = selectedArticleRef?.version_key;

    if (!article_id || !scope || !law_name || !version_key || !setKey) {
      return;
    }

    const controller = new AbortController();
    setReverseLoading(true);
    setReverseErr(null);

    const url =
      `${API_BASE}/api/law/articles/${encodeURIComponent(
        article_id
      )}/reverse/full` +
      `?set_key=${encodeURIComponent(setKey)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&law_name=${encodeURIComponent(law_name)}` +
      `&version_key=${encodeURIComponent(version_key)}`;

    fetch(url, { signal: controller.signal })
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(text || `HTTP ${r.status}`);
        return JSON.parse(text);
      })
      .then((json: ReverseLookupResponse) => {
        const usages = Array.isArray(json?.usages) ? json.usages : [];
        setReverseData({ ...json, usages });
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        console.error(e);
        setReverseErr(String(e?.message ?? e));
      })
      .finally(() => setReverseLoading(false));

    return () => controller.abort();
  }, [
    setKey,
    selectedArticleRef?.article_id,
    selectedArticleRef?.scope,
    selectedArticleRef?.law_name,
    selectedArticleRef?.version_key,
  ]);

  /* -------------------------
   * Reverse Issues (dedup)
   * ------------------------- */
  const reverseIssues = useMemo(() => {
    const usagesRaw = reverseData?.usages ?? [];
    const usages = Array.isArray(usagesRaw) ? usagesRaw : [];

    const map = new Map<string, ReverseUsage>();
    for (const u of usages) {
      if (!map.has(u.issue_title)) {
        map.set(u.issue_title, u);
      }
    }
    return Array.from(map.values());
  }, [reverseData]);


  useRecordThoughtTrace({
  userId,
  parentType: "law",
  parentId: currentChapter ?? "",
  traceType: "article",
  traceId: selectedArticleRef?.article_id ?? "",
});

  /* ======================================================
   * Render 
   * ====================================================== */

return (
  <div style={{ height: "100%", background: "#fff", overflowY: "auto" }}>
    {/* =========================
     * Resolve Header
     * ========================= */}
    <div style={{ padding: 24, borderBottom: "1px solid #e5e7eb" }}>

      {process.env.NODE_ENV === "development" && (
        <div style={{ fontSize: 12.5, color: "#9ca3af", marginTop: 1 }}>
          DEBUG · 적용 법령 세트 : {setKey || "—"}
        </div>
      )}


        {!setKey && (
          <div style={{ marginTop: 12, color: "#6b7280" }}>
            snapshot 로딩 중…
          </div>
        )}

        {setKey && !q && (
          <div style={{ marginTop: 12, color: "#6b7280" }}>
            사이드바에서 조문 번호를 입력하고 Enter를 누르세요.
          </div>
        )}

        {resolveErr && (
          <div style={{ marginTop: 12, color: "#b91c1c" }}>
            조회 실패: {resolveErr}
          </div>
        )}

        {resolveLoading && (
          <div style={{ marginTop: 12, color: "#6b7280" }}>조회 중…</div>
        )}

        {/* =========================
         * Resolve Tags
         * ========================= */}
        {setKey && q && !resolveLoading && !resolveErr && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 32,          // 그룹 간 간격만
            alignItems: "flex-start",
          }}
        >

            {results.map((group) => {
              const matched = Array.isArray(group?.matched) ? group.matched : [];

              return (
                <div key={`${group.scope}-${group.law_name}-${group.version_key}`}>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
                    {labelScope(group.scope)}
                  </div>

                  {matched.length === 0 ? (
                    <div style={{ fontSize: 13, color: "#6b7280" }}>매칭 없음</div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {matched.map((a) => {
                        const active =
                          selectedArticleRef?.article_id === a.article_id &&
                          selectedArticleRef?.scope === group.scope;

                        return (
                          <span
                            key={`${group.scope}-${a.article_id}`}
                            onClick={() =>
                              setSelectedArticleRef({
                                scope: group.scope,
                                law_name: group.law_name,
                                version_key: group.version_key,
                                article_id: a.article_id,
                                title: a.title,
                              } as SelectedArticleRef)
                            }
                            style={{
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: active ? "#1f3a8a" : "#e0e7ff",
                              color: active ? "#fff" : "#111827",
                              fontSize: 13,
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            title={`${group.law_name} / ${group.version_key}`}
                          >
                            {a.article_id
                              .replace(/^ART_/, "제 ")
                              .replace(/_/g, "의 ")}
                            조
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================
       * Read View (선택된 조문)
       * ========================= */}
      <div style={{ padding: "2px 24px 24px" }}>

        {!selectedArticleRef && (
          <div style={{ color: "#6b7280" }}>
            위에서 조문을 선택하면 정독 화면이 표시됩니다.
          </div>
        )}

        {selectedArticleRef && readLoading && (
          <div style={{ color: "#6b7280" }}>조문 불러오는 중…</div>
        )}

        {selectedArticleRef && readErr && (
          <div style={{ color: "#b91c1c" }}>조문 로딩 실패: {readErr}</div>
        )}

        {readData && (
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
                      background: "#ffffff",
                      color: "#111827",
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
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.96)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1.06)";
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

            <ArticleHeader articleNo={readData.article_no} title={readData.title} />
            <ArticleBody paragraphs={readData.paragraphs} />
            <ArticleMetaFooter />
            <ReverseIssuesSection
              loading={reverseLoading}
              error={reverseErr}
              issues={reverseIssues}
            />
            </main>
         )}

      </div>
    </div>
  );
}

/* =========================
 * Rendering 
 * ========================= */
function stripLeadingMarkers(text: string): string {
  if (!text) return text;

  return text
    // ① ~ ⑳
    .replace(/^[\u2460-\u2473]\s*/g, "")
    // 1. / 2. / 10.
    .replace(/^\d{1,2}\.\s*/g, "")
    // (1)
    .replace(/^\(\d{1,2}\)\s*/g, "")
    // 가. 나. 다. 라. 마.
    .replace(/^[가-힣]\.\s*/g, "")
    .trim();
}

function stripLeadingArticleNoFromTitle(title?: string): string | undefined {
  if (!title) return title;

  return title
    // 1️⃣ "제3조", "제 3조", "제3의2조", "제 3의 2조"
    .replace(/^제\s*\d+(?:\s*의\s*\d+)?조\s*/g, "")
    // 2️⃣ 남아있는 "의2", "의 3" 같은 찌꺼기
    .replace(/^의\s*\d+\s*/g, "")
    .trim();
}

function ArticleHeader({ articleNo, title }: { articleNo: string; title?: string }) {
  const prettyTitle = stripLeadingArticleNoFromTitle(title);

  return (
    <header style={styles.header}>
      <h1 style={styles.articleNo}>제 {articleNo}조</h1>
      {prettyTitle && <h2 style={styles.articleTitle}>{prettyTitle}</h2>}
    </header>
  );
}


function ArticleBody({ paragraphs }: { paragraphs: Paragraph[] }) {
  return (
    <section style={styles.body}>
      {paragraphs.map((p, idx) => (
        <ParagraphBlock
          key={`para-${p.id ?? "noid"}-${idx}`}
          index={idx + 1}
          paragraph={p} />
      ))}
    </section>
  );
}

function ParagraphBlock({ index, paragraph }: { index: number; paragraph: Paragraph }) {
  return (
    <div style={styles.paragraph}>
      <div style={styles.paragraphIndex}>{toCircleNumber(index)}</div>

      <div style={styles.paragraphContent}>
        <p style={styles.paragraphText}> {stripLeadingMarkers(paragraph.text)}</p>

      {paragraph.items?.map((item, idx) => (
        <ItemBlock
          key={`${paragraph.id}-${item.id}-${idx}`}
          item={item}
          index={idx + 1}/>
        ))}
      </div>
    </div>
  );
}

    function ItemBlock({
      item,
      index,
    }: {
      item: Item;
      index: number;
    }) {
      return (
        <div style={styles.item}>
          <span style={styles.itemBullet}>
        {toItemNumber(index)}
      </span>
      <div>
        <p style={styles.itemText}> {stripLeadingMarkers(item.text)}</p>
        {item.subitems?.map((s, idx) => (
          <SubItemBlock
            key={`${item.id}-${s.id}-${idx}`}
            subitem={s}
            index={idx + 1}
          />
        ))}

      </div>
    </div>
  );
}

    function SubItemBlock({
      subitem,
      index,
    }: {
      subitem: SubItem;
      index: number;
    }) {
      return (
        <div style={styles.subItem}>
          <span style={styles.subItemBullet}>
            {toKoreanLetter(index)}
      </span>
      <p style={styles.subItemText}>{stripLeadingMarkers(subitem.text)}</p>
    </div>
  );
}

function ArticleMetaFooter() {
  return (
    <footer style={styles.footer}>
      <p style={styles.footerText}>※ 본 조문은 해석·검토 흐름과 연결될 수 있습니다.</p>
    </footer>
  );
}

// 항 번호 (①, ②, …, ⑩, ⑪ …)
function toCircleNumber(n: number) {
  const circled = [
    "①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩",
    "⑪","⑫","⑬","⑭","⑮","⑯","⑰","⑱","⑲","⑳"
  ];
  return circled[n - 1] ?? `${n}`;
}

// 호 번호 (1., 2., 3.)
function toItemNumber(n: number) {
  return `${n}.`;
}

// 목 번호 (가., 나., 다.)
function toKoreanLetter(n: number) {
  const letters = ["가","나","다","라","마","바","사","아","자","차"];
  return letters[n - 1] ? `${letters[n - 1]}.` : `${n}.`;
}

function normalizeReasoningTitle(raw: string): string {
  return raw
    .replace(/\[[^\]]+]/g, "")   // [핵심 쟁점] 같은 태그 제거
    .replace(/\s+/g, " ")        // 줄바꿈/다중 공백 → 공백 하나
    .trim();
}

function ReverseIssuesSection({
  loading,
  error,
  issues,
}: {
  loading: boolean;
  error: string | null;
  issues: ReverseUsage[];
}) {
  const { setSelectedIssueId, setGraphMode, setCurrentChapter, } = useLawUI();

  if (loading) {
    return (
      <div style={{ marginTop: 24, color: "#6b7280", fontSize: 13 }}>
        관련 쟁점 불러오는 중…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: 24, color: "#b91c1c", fontSize: 13 }}>
        관련 쟁점 조회 실패
      </div>
    );
  }

  if (!issues.length) return null;

  return (
    <section style={{ marginTop: 16}}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
        이 조문이 사용된 쟁점
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {issues.map((issue) => (
          <button
            key={issue.issue_title}
            onClick={() => {
              setCurrentChapter(issue.chapter_id); // 🔥 이게 빠져있었다
              setSelectedIssueId(issue.issue_title);
              setGraphMode("REASONING");
            }}

            style={{
              textAlign: "left",
              padding: "8px 16px",
              borderRadius: 8,
              background: "#edf5feff",
              border: "1px solid #e5e7eb",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {issue.issue_title}
          </button>
        ))}
      </div>
    </section>
  );
}

const styles = {
  /* =========================
   * Layout
   * ========================= */

  container: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "32px 24px",
    background: "#ffffff",
    color: "#111827",
  },

  body: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  } as const,

  /* =========================
   * Header
   * ========================= */

  header: {
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 12,
    marginBottom: 16,
  },

  articleNo: {
    fontSize: 20,
    fontWeight: 700,
  },

  articleTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: 500,
    color: "#374151",
  },

  /* =========================
   * Paragraph
   * ========================= */

  paragraph: {
    display: "flex",
    gap: 12,
  },

  paragraphIndex: {
    fontWeight: 600,
    color: "#1e3a8a",
    minWidth: 24,
  },

  paragraphContent: {
    flex: 1,
  },

  paragraphText: {
    fontSize: 14.5,
    lineHeight: 1.8,
  },

  /* =========================
   * Item / SubItem
   * ========================= */
  
  itemBullet: {
    fontWeight: 500,
  },
  item: {
    display: "flex",
    gap: 8,
    marginTop: 10,
    paddingLeft: 16,
  },

  itemText: {
    fontSize: 14,
    lineHeight: 1.7,
  },

  subItem: {
    display: "flex",
    gap: 6,
    paddingLeft: 16,
    marginTop: 6,
  },

  subItemBullet: {
    fontWeight: 500,
  },

  subItemText: {
    fontSize: 13.5,
    lineHeight: 1.6,
    color: "#374151",
  },

  /* =========================
   * Footer
   * ========================= */

  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1px solid #e5e7eb",
  },

  footerText: {
    fontSize: 12.5,
    color: "#6b7280",
  },
};


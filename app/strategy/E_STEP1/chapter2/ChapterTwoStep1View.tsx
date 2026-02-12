//app/strategy/E_STEP1/chapter2/ChapterTwoStep1View.tsx

"use client";

import { Chapter2Step1ViewModel } from "./types";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getStrategyAccess } from "../../access";
import { useState } from "react";
import React from "react";

type Props = {
  bookId: string;
  data: Chapter2Step1ViewModel;
};

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  bgSoft: "#fafafa",
};

/* ====================================================== */
/* View */
/* ====================================================== */

export function ChapterTwoStep1View({ bookId, data }: Props) {
  const { userId } = useAuth();
  const userAccess = useUserAccessLevel();
  const access = getStrategyAccess(userAccess, "E_STEP1");
  const isLocked = access !== "FULL";
  const [showHint, setShowHint] = useState(false);
  const saveThought = useSaveThought();
  const [saving, setSaving] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [openUnits, setOpenUnits] = useState<Record<number, boolean>>({});

  useRecordStrategyTrace({
    userId,
    parentType: "strategy",
    parentId: bookId,
    traceType: "reasoning",
    traceId: "chapter2_step1",
  });

  return (
    <article style={styles.container}>
      {/* 저장 버튼 */}
      <div style={{ position: "fixed", right: 24, bottom: 160, zIndex: 60 }}>
        <button
          onClick={async () => {
            if (!userId || saving) return;
            setSaving(true);
            try {
              await saveThought({
                parentType: "strategy",
                parentId: bookId,
                targetType: "reasoning",
                targetId: `E_STEP1:chapter2`,
              });
            } finally {
              setSaving(false);
            }
          }}
          style={styles.floatingButton}
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

        >
          🔖
        </button>
      </div>

      {/* SUMMARY */}
      <Section title="📘 제2장 일반세무조사">
        <div style={styles.summaryBox}>
        {(() => {
          const sentences = splitSentences(data.summaryText);
          const previewCount = 3;
          const visible = summaryOpen
            ? sentences
            : sentences.slice(0, previewCount);

          return (
            <>
              {visible.map((sentence, idx) => (
                <p
                  key={idx}
                  style={{
                    ...styles.summary,
                    fontWeight: idx === 0 ? 600 : 400,
                  }}
                >
                  {sentence}
                </p>
              ))}

              {sentences.length > previewCount && (
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setSummaryOpen((prev) => !prev)}
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {summaryOpen
                      ? "접기 ▲"
                      : `더 보기 (${sentences.length - previewCount}) ▼`}
                  </button>
                </div>
              )}
            </>
          );
        })()}
        </div>
      </Section>

      <Divider />

      {/* INVESTIGATION STRUCTURE */}
      <CollapsibleSection title="🏗 조사 구조 단위">
        {data.investigationUnits.map((unit, idx) => (
          <Card key={idx}>
            <CardTitle>{unit.structural_unit}</CardTitle>
            <ArticleList articles={unit.evidence_articles} />
            {(() => {
              const sentences = splitSentences(unit.description);
              const previewCount = 2;
              const isOpen = openUnits[idx] ?? false;

              const visible = isOpen
                ? sentences
                : sentences.slice(0, previewCount);

              return (
                <>
                  {visible.map((sentence, i) => (
                    <BodyText
                      key={i}
                      style={{
                        marginBottom: 12,
                        lineHeight: 1.85,
                        fontWeight: i === 0 ? 500 : 400,
                        color: i === 0 ? "#111827" : "#374151",
                      }}
                    >
                      {sentence}
                    </BodyText>
                  ))}

                  {sentences.length > previewCount && (
                    <div style={{ marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenUnits((prev) => ({
                            ...prev,
                            [idx]: !isOpen,
                          }))
                        }
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        {isOpen
                          ? "접기 ▲"
                          : `더 보기 (${sentences.length - previewCount}) ▼`}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}

          <div style={{ marginTop: 16 }}>
            <BodyText style={{ fontWeight: 600, marginBottom: 8 }}>
              <strong>구조 효과:</strong>
            </BodyText>
            {splitSentences(unit.structural_effect).map((sentence, i) => (
              <BodyText key={i} style={{ lineHeight: 1.85 }}>
                {sentence}
              </BodyText>
            ))}
          </div>

            <EvidenceBadge status={unit.evidence_status} />
          </Card>
        ))}
      </CollapsibleSection>

      {/* OPERATING PRINCIPLES */}
      <CollapsibleSection title="⚖ 핵심 작동 원칙">
        {data.principles.map((p, idx) => (
          <Card key={idx}>
            <CardTitle>{p.principle}</CardTitle>
            <ArticleList articles={p.evidence_articles} />
            {splitSentences(p.how_it_operates).map((s, i) => (
              <BodyText key={i}>{s}</BodyText>
            ))}
          {p.when_it_breaks &&
            splitSentences(p.when_it_breaks).map((s, i) => (
              <BodyText key={i}>
                {i === 0 && <strong>예외: </strong>}
                {s}
              </BodyText>
            ))}

            <EvidenceBadge status={p.evidence_status} />
          </Card>
        ))}
      </CollapsibleSection>

      {/* AUTHORITY / CONTROL */}
      <CollapsibleSection title="🏛 권한·통제 지점">
        {data.controlPoints.map((c, idx) => (
          <Card key={idx}>
            <CardTitle>{c.control_point}</CardTitle>
            <BodyText>
              <span style={{ ...styles.labelBase, ...styles.labelAuthority }}>
                통제 주체
              </span>
              {c.who_controls}
            </BodyText>

            <BodyText>
              <span style={{ ...styles.labelBase, ...styles.labelTiming }}>
                개입 시점
              </span>
              {c.timing_in_flow}
            </BodyText>
            {splitSentences(c.how_control_is_described_in_text).map((s, i) => (
              <BodyText key={i}>{s}</BodyText>
            ))}
            <ArticleList articles={c.evidence_articles} />
            <EvidenceBadge status={c.evidence_status} />
          </Card>
        ))}
      </CollapsibleSection>

      {/* BRANCH POINTS */}
      <CollapsibleSection title="🔀 주요 분기 지점">
        {data.branchPoints.map((b, idx) => (
          <Card key={idx}>
            <CardTitle>Q. {b.decision_question}</CardTitle>
            {splitSentences(b.trigger_defined_in_text).map((s, i) => (
              <BodyText key={i}>
                {i === 0 && (
                  <span style={{ ...styles.labelBase, ...styles.labelTrigger }}>
                    Trigger
                  </span>
                )}
                {s}
              </BodyText>
            ))}
            {splitSentences(b.structural_consequence).map((s, i) => (
              <BodyText key={i}>
                {i === 0 && (
                  <span style={{ ...styles.labelBase, ...styles.labelResult }}>
                    구조적 결과
                  </span>
                )}
                {s}
              </BodyText>
            ))}
            {splitSentences(b.next_structural_change_defined_in_text).map((s, i) => (
              <BodyText key={i}>
                {i === 0 && (
                  <span style={{ ...styles.labelBase, ...styles.labelNext }}>
                    다음 전환
                  </span>
                )}
                {s}
              </BodyText>
            ))}
            <ArticleList articles={b.evidence_articles} />
            <EvidenceBadge status={b.evidence_status} />
          </Card>
        ))}
      </CollapsibleSection>

      {/* TABLES */}
      <Section title="📊 구조 비교 표">
        {data.tables.map((table, idx) => (
          <div key={idx} style={{ marginBottom: 48 }}>
            <h3 style={styles.tableTitle}>{table.table_title}</h3>
            <p style={styles.tablePurpose}>{table.table_purpose}</p>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(table.rows[0] ?? {}).map((col) => (
                      <th key={col} style={styles.th}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {Object.entries(row).map(([col, value]) => (
                        <td key={col} style={styles.td}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ))}
      </Section>

    </article>
  );
}

function splitSentences(text: string): string[] {
  if (!text) return [];
  return text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];

  // 마침표 기준 분리 (괄호 안 조문은 그대로 유지)
  const sentences = text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const paragraphs: string[] = [];

  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences.slice(i, i + 2).join(" ");
    paragraphs.push(chunk);
  }

  return paragraphs;
}

function Section({ title, children }: any) {
  return (
    <section style={{ marginBottom: 56 }}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Divider() {
  return <hr style={{ borderColor: colors.line, marginBottom: 24 }} />;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  previewCount = 3,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  previewCount?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const childArray = React.Children.toArray(children);
  const hasMore = childArray.length > previewCount;

  const visibleChildren = open ? childArray : childArray.slice(0, previewCount);

  return (
    <section
      style={{
        marginBottom: 56,
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: 32,
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 18,
          color: "#111827",
        }}
      >
        {title}
      </h2>

      <div>
        {visibleChildren}

        {hasMore && (
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              style={{
                fontSize: 13,
                color: "#6b7280",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {open ? "접기 ▲" : `더 보기 (${childArray.length - previewCount}) ▼`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}


function Card({ children }: any) {
  return <div style={styles.card}>{children}</div>;
}

function CardTitle({ children }: any) {
  return (
    <div style={styles.cardTitleWrapper}>
      <div style={styles.cardTitleBar} />
      <h3 style={styles.cardTitle}>{children}</h3>
    </div>
  );
}

function BodyText({ children }: any) {
  return <p style={styles.bodyText}>{children}</p>;
}

function ArticleList({ articles }: { articles: string[] }) {
  return <div style={styles.articleList}>{articles.join(", ")}</div>;
}

function EvidenceBadge({ status }: { status: "근거 있음" | "근거 부족" }) {
  const good = status === "근거 있음";
  return (
    <span
      style={{
        ...styles.badge,
        background: good ? "#f0fdf4" : "#fef2f2",
        color: good ? "#065f46" : "#991b1b",
      }}
    >
      {status}
    </span>
  );
}
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 960,
    margin: "0 auto",
    paddingTop: 18,
    lineHeight: 1.7,
    color: colors.ink,
  },
  summaryBox: {
    border: `1px solid ${colors.line}`,
    borderRadius: 10,
    padding: 20,
    background: colors.bgSoft,
  },

  summary: {
    fontSize: 15,
    lineHeight: 1.9,
    color: "#1f2937",
    marginBottom: 18,
    wordBreak: "keep-all",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 18,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "20px 22px",
    marginBottom: 24,
    background: "#ffffff",
  },

  cardTitleWrapper: {
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  },

  cardTitleBar: {
    width: 4,
    height: 18,
    background: "#1e3a8a", // 남색
    borderRadius: 2,
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
  },

  bodyText: {
    fontSize: 14,
    marginBottom: 8,
  },
  articleList: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 6,
  },
  badge: {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: 6,
    fontSize: 11,
    marginTop: 6,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontSize: 20,
    cursor: "pointer",
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 6,
  },
  tablePurpose: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  tableMarkdown: {
    fontSize: 13,
    lineHeight: 1.7,
    border: "1px solid #e5e7eb",
    padding: 16,
    borderRadius: 8,
    background: "#fafafa",
  },

  tableWrapper: {
  overflowX: "auto",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
},

table: {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
  lineHeight: 1.6,
  minWidth: 720,
},

th: {
  textAlign: "left",
  padding: "10px 12px",
  background: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600,
  whiteSpace: "nowrap",
},

td: {
  padding: "10px 12px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top",
},
labelBase: {
  display: "inline-block",
  fontSize: 12,
  fontWeight: 600,
  marginRight: 6,
  letterSpacing: "0.2px",
},

labelAuthority: {
  color: "#1e3a8a", // 남색
},

labelTiming: {
  color: "#0f766e", // 청록
},

labelTrigger: {
  color: "#7c3aed", // 보라
},

labelResult: {
  color: "#b45309", // 브라운 오렌지
},

labelNext: {
  color: "#374151", // 딥그레이
},


};

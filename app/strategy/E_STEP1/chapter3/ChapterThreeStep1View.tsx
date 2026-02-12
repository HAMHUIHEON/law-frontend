//app/strategy/E_STEP1/chapter3/ChapterThreeStep1View.tsx
"use client";

import { Chapter3Step1ViewModel } from "./types";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getStrategyAccess } from "../../access";
import { useState } from "react";
import React from "react";

type Props = {
  bookId: string;
  data: Chapter3Step1ViewModel;
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

export function ChapterThreeStep1View({ bookId, data }: Props) {
  const { userId } = useAuth();
  const userAccess = useUserAccessLevel();
  const access = getStrategyAccess(userAccess, "E_STEP1");
  const [showHint, setShowHint] = useState(false);
  const saveThought = useSaveThought();
  const [saving, setSaving] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  useRecordStrategyTrace({
    userId,
    parentType: "strategy",
    parentId: bookId,
    traceType: "reasoning",
    traceId: "chapter3_step1",
  });

  return (
    <article style={styles.container}>
      {/* 저장 버튼 */}
      <div style={{ position: "fixed", right: 24, bottom: 160 }}>
        <button
          onClick={async () => {
            if (!userId || saving) return;
            setSaving(true);
            try {
              await saveThought({
                parentType: "strategy",
                parentId: bookId,
                targetType: "reasoning",
                targetId: `E_STEP1:chapter3`,
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
      <Section title="📘 제3장 조세범칙조사">
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

      {/* TRANSITION */}
      <Section title="🔄 '일반세무조사'에서의 전환">
        <Card>
          <LabelBlock label="전환 요건">
            {data.transition.trigger_conditions}
          </LabelBlock>

          <LabelBlock label="규칙 수정 방식">
            {data.transition.how_chapter2_rules_are_modified}
          </LabelBlock>
        </Card>
      </Section>

      {/* INVESTIGATION STRUCTURE */}
      <CollapsibleSection title="🏗 범칙조사 구조 단위">
        {data.investigationUnits.map((unit, idx) => (
          <Card key={idx}>
            <CardTitle>{unit.structural_unit}</CardTitle>
            {splitSentences(unit.description).map((s, i) => (
              <BodyText key={i}>{s}</BodyText>
            ))}
            <LabelBlock label="구조 효과">
              {unit.structural_effect}
            </LabelBlock>
          </Card>
        ))}
      </CollapsibleSection>

      {/* AUTHORITY */}
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

      {/* COERCIVE MEASURES */}
      <CollapsibleSection title="⚖ 강제수단 구조">
        {data.coerciveMeasures.map((m, idx) => (
          <Card key={idx}>
            <CardTitle>{m.measure_type}</CardTitle>

            <BodyText>
              <span style={{ ...styles.labelBase, ...styles.labelTrigger }}>
                발동 요건
              </span>
              {m.trigger_defined_in_text}
            </BodyText>

            <BodyText>
              <span style={{ ...styles.labelBase, ...styles.labelAuthority }}>
                승인 주체
              </span>
              {m.approving_authority}
            </BodyText>

            <BodyText>
              <span style={{ ...styles.labelBase, ...styles.labelResult }}>
                절차상 한계
              </span>
              {m.procedural_limit_defined_in_text}
            </BodyText>
          </Card>
        ))}
      </CollapsibleSection>

        {/* DECISION PIPELINE */}
        <CollapsibleSection title="🧭 처벌 결정 파이프라인">
          {data.decisionPipeline.map((d, idx) => (
            <Card key={idx}>
              <CardTitle>{d.stage}</CardTitle>

              <BodyText>
                <span style={{ ...styles.labelBase, ...styles.labelAuthority }}>
                  결정 주체
                </span>
                {d.decision_maker}
              </BodyText>

              <BodyText>
                <span style={{ ...styles.labelBase, ...styles.labelResult }}>
                  결정 내용
                </span>
                {d.decision_content}
              </BodyText>

              <BodyText>
                <span style={{ ...styles.labelBase, ...styles.labelNext }}>
                  가능한 후속 경로
                </span>
                {d.next_possible_outcomes.join(", ")}
              </BodyText>
            </Card>
          ))}
        </CollapsibleSection>

          {/* TABLES */}
            {data.tables.length > 0 && (
            <Section title="📊 절차 구조 요약표">
                {data.tables.map((table, idx) => (
                <div key={idx} style={{ marginBottom: 48 }}>
                    <h3 style={styles.cardTitle}>{table.table_title}</h3>

                    <BodyText style={{ color: colors.muted }}>
                    {table.table_purpose}
                    </BodyText>

                    <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                        {Object.keys(table.rows[0] || {}).map((key, colIdx) => {
                          let width = "20%";

                          if (colIdx === 0) width = "18%";   // 단계
                          if (colIdx === 1) width = "28%";   // 주요 행위·결정
                          if (colIdx === 2) width = "16%";   // 관련 주체
                          if (colIdx === 3) width = "22%";   // 통제 장치
                          if (colIdx === 4) width = "16%";   // 관련 조문

                          return (
                            <th key={key} style={{ ...styles.th, width }}>
                              {key}
                            </th>
                          );
                        })}
                        </tr>
                        </thead>

                        <tbody>
                        {table.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {Object.values(row).map((value, cIdx) => (
                              <td
                                key={cIdx}
                                style={{
                                  ...styles.td,
                                  textAlign: cIdx === 0 ? "left" : "left",
                                  fontWeight: cIdx === 0 ? 600 : 400,
                                }}
                              >
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                    <div style={{ marginTop: 12 }}>
                    <EvidenceBadge status={table.evidence_status} />
                    </div>
                </div>
                ))}
            </Section>
            )}

    </article>
  );
}

/* ====================================================== */
/* 공통 UI */
/* ====================================================== */
function ArticleList({ articles }: { articles: string[] }) {
  return <div style={styles.articleList}>{articles.join(", ")}</div>;
}

function EvidenceBadge({
  status,
}: {
  status: "근거 있음" | "근거 부족";
}) {
  const good = status === "근거 있음";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 6px",
        borderRadius: 6,
        fontSize: 11,
        marginTop: 6,
        background: good ? "#f0fdf4" : "#fef2f2",
        color: good ? "#065f46" : "#991b1b",
      }}
    >
      {status}
    </span>
  );
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
}: any) {
  const [open, setOpen] = useState(defaultOpen);
  const childArray = React.Children.toArray(children);
  const previewCount = 3;

  const visible = open
    ? childArray
    : childArray.slice(0, previewCount);

  return (
    <section style={{ marginBottom: 56 }}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {visible}
      {childArray.length > previewCount && (
        <button
          onClick={() => setOpen(!open)}
          style={styles.moreBtn}
        >
          {open ? "접기 ▲" : "더 보기 ▼"}
        </button>
      )}
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

function LabelBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p style={styles.bodyText}>
      <span style={styles.label}>{label}</span>
      {children}
    </p>
  );
}

function BodyText({ children }: any) {
  return <p style={styles.bodyText}>{children}</p>;
}

function splitSentences(text: string): string[] {
  if (!text) return [];
  return text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ====================================================== */
/* Styles */
/* ====================================================== */

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
    marginBottom: 10,
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
    marginBottom: 18,
  },

  cardTitleBar: {
    width: 4,
    height: 22,
    background: "#1e3a8a",
    borderRadius: 2,
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
    lineHeight: 1.4,
  },

  label: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 600,
    marginRight: 6,
    color: "#1e3a8a",
  },
  bodyText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 1.85,
  },
  moreBtn: {
    fontSize: 13,
    color: "#6b7280",
    background: "none",
    border: "none",
    cursor: "pointer",
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
  textAlign: "center",
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

articleList: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 6,
  },

};

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

  const saveThought = useSaveThought();
  const [saving, setSaving] = useState(false);

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
        >
          🔖
        </button>
      </div>

      {/* SUMMARY */}
      <Section title="📘 제2장 일반세무조사">
        <div style={styles.summaryBox}>
        {splitIntoParagraphs(data.summaryText).map((para, idx) => (
          <p key={idx} style={styles.summary}>
            {para}
          </p>
        ))}

        </div>
      </Section>

      <Divider />

      {/* INVESTIGATION STRUCTURE */}
      <CollapsibleSection title="🏗 조사 구조 단위">
        {data.investigationUnits.map((unit, idx) => (
          <Card key={idx}>
            <CardTitle>{unit.structural_unit}</CardTitle>
            <ArticleList articles={unit.evidence_articles} />
            {splitIntoParagraphs(unit.description).map((para, i) => (
              <BodyText key={i}>{para}</BodyText>
            ))}

            <BodyText>
              <strong>구조 효과:</strong> {unit.structural_effect}
            </BodyText>
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
            <BodyText>{p.how_it_operates}</BodyText>
            {p.when_it_breaks && (
              <BodyText>
                <strong>예외:</strong> {p.when_it_breaks}
              </BodyText>
            )}
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
              <strong>통제 주체:</strong> {c.who_controls}
            </BodyText>
            <BodyText>
              <strong>개입 시점:</strong> {c.timing_in_flow}
            </BodyText>
            {splitIntoParagraphs(c.how_control_is_described_in_text).map((para, i) => (
              <BodyText key={i}>{para}</BodyText>
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
            <BodyText>
              <strong>Trigger:</strong> {b.trigger_defined_in_text}
            </BodyText>
            <BodyText>
              <strong>구조적 결과:</strong> {b.structural_consequence}
            </BodyText>
            <BodyText>
              <strong>다음 전환:</strong>{" "}
              {b.next_structural_change_defined_in_text}
            </BodyText>
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

      {/* BRIDGE */}
      <Section title="🔎 STEP2로 이어지는 관문">
        <Card>
          <BodyText>
            <strong>STEP1 한계:</strong> {data.bridge.limit}
          </BodyText>
          <BodyText>
            <strong>STEP2 초점:</strong> {data.bridge.focus}
          </BodyText>
        </Card>
      </Section>
    </article>
  );
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

function CollapsibleSection({ title, children }: any) {
  return (
    <section style={{ marginBottom: 56 }}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Card({ children }: any) {
  return <div style={styles.card}>{children}</div>;
}

function CardTitle({ children }: any) {
  return <h3 style={styles.cardTitle}>{children}</h3>;
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
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 8,
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

};

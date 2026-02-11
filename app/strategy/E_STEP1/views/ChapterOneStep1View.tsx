"use client";

import { ChapterOneStep1ViewModel } from "../types";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getStrategyAccess } from "../../access";
import React from "react";


type Props = {
  bookId: string;
  data: ChapterOneStep1ViewModel;
};


const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  bgSoft: "#fafafa",
  deep: "#374151",
};

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // 👉 children을 배열로 변환
  const childArray = React.Children.toArray(children);

  const previewCount = 3;

  const visibleChildren = open
    ? childArray
    : childArray.slice(0, previewCount);

  const hasMore = childArray.length > previewCount;

  return (
    <section
      style={{
        marginBottom: 56,
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: 32,
      }}
    >
      {/* 헤더 */}
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

      {/* 내용 */}
      <div>
        {visibleChildren}

        {hasMore && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              style={{
                fontSize: 13,
                color: "#6b7280",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {open
                ? "접기 ▲"
                : `더 보기 (${childArray.length - previewCount}) ▼`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function ChapterOneStep1View({ bookId, data }: Props) {
    const { userId } = useAuth();
    const userAccess = useUserAccessLevel();
    const access = getStrategyAccess(userAccess, "E_STEP1");
    const isLocked = access !== "FULL";

    const saveThought = useSaveThought();
    const [saving, setSaving] = useState(false);
    const [showHint, setShowHint] = useState(false);

    useRecordStrategyTrace({
    userId,
    parentType: "strategy",
    parentId: bookId,
    traceType: "reasoning",
    traceId: "chapter1_step1",
    });

  return (
    <article style={styles.container}>
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
                targetId: `E_STEP1:chapter1`,
                });
            } finally {
                setSaving(false);
            }
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
      <Section title="📘 제1장 개관">
        <div style={styles.summaryBox}>
          <p style={styles.summary}>{data.summary}</p>
        </div>
      </Section>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* PRINCIPLES */}
      <CollapsibleSection title="⚖ 기본 원칙 축">
        {data.principles.map((p, idx) => (
          <Card key={idx}>
            <CardTitle>{p.title}</CardTitle>
            <ArticleList articles={p.articles} />
            <BodyText>{p.meaning}</BodyText>
            <EvidenceBadge status={p.evidenceStatus} />
          </Card>
        ))}
      </CollapsibleSection>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />
      {/* AUTHORITY */}
      <CollapsibleSection title="🏛 권한·통제 구조">
        {data.authorities.map((a, idx) => (
          <Card key={idx}>
            <CardTitle>{a.topic}</CardTitle>
            <ArticleList articles={a.articles} />
            <BodyText>{a.controlFunction}</BodyText>
            <EvidenceBadge status={a.evidenceStatus} />
          </Card>
        ))}
      </CollapsibleSection>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* PROCEDURE */}
      <CollapsibleSection title="🔁 절차 단계 구조">
        {data.procedureStages.map((s, idx) => (
          <Card key={idx}>
            <CardTitle>{s.stage}</CardTitle>
            <ArticleList articles={s.articles} />
            <BodyText>{s.keyControls}</BodyText>
            <EvidenceBadge status={s.evidenceStatus} />
          </Card>
        ))}
      </CollapsibleSection>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />
      {/* TABLE */}
      <Section title="📊 조사 유형 비교">
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
        <thead>
        <tr>
            {data.definitionTable.columns.map((col, idx) => (
            <th key={idx} style={styles.th}>{col}</th>
            ))}
        </tr>
        </thead>
        <tbody>
        {data.definitionTable.rows.map((row, idx) => (
            <tr key={idx}>
            <td style={styles.td}>{row.category}</td>
            <td style={styles.td}>{row.definition}</td>
            <td style={styles.td}>{row.authority}</td>
            <td style={styles.td}>{row.noticeRequirement}</td>
            <td style={styles.td}>
                {row.notes}
                <EvidenceBadge status={row.evidenceStatus} />
            </td>
            </tr>
        ))}
        </tbody>
          </table>
        </div>
      </Section>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* DEFENSE */}
      <CollapsibleSection title="🛡 방어 포인트">
        {data.defensePoints.map((d, idx) => (
          <Card key={idx}>
            <CardTitle>{d.scenario}</CardTitle>
            <ArticleList articles={d.articles} />
            <BodyText>
              <strong>요건:</strong> {d.legalRequirement}
            </BodyText>
            <BodyText>{d.commentary}</BodyText>
            <EvidenceBadge status={d.evidenceStatus} />
          </Card>
        ))}
      </CollapsibleSection>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* INTERNAL */}
      <CollapsibleSection title="⚙ 내부 운영 포인트">
        {data.internalOperations.map((i, idx) => (
          <Card key={idx}>
            <CardTitle>{i.area}</CardTitle>
            <ArticleList articles={i.articles} />
            <BodyText>{i.implication}</BodyText>
            <EvidenceBadge status={i.evidenceStatus} />
          </Card>
        ))}
      </CollapsibleSection>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* BRIDGE */}
      <CollapsibleSection title="🔎 다음 장으로 이어지는 질문">
        {data.bridgeQuestions.map((b, idx) => (
          <Card key={idx}>
            <CardTitle>{b.question}</CardTitle>
            <BodyText style={{ color: colors.muted }}>
              → {b.nextChapter}
            </BodyText>
            <BodyText>{b.why}</BodyText>
          </Card>
        ))}
      </CollapsibleSection>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* EXTRA */}
      {data.extraExplanations.length > 0 && (
        <CollapsibleSection title="📌 추가 설명">
          {data.extraExplanations.map((e, idx) => (
            <Card key={idx}>
              <CardTitle>{e.topic}</CardTitle>
              <BodyText>{e.reasonSeparated}</BodyText>
              <BodyText>{e.notes}</BodyText>
            </Card>
          ))}
        </CollapsibleSection>
      )}

    </article>
  );
}

/* ============================== */
/* 공통 UI 컴포넌트 */
/* ============================== */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 56 }}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={styles.block}>{children}</div>;
}


function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={styles.cardTitle}>{children}</h3>;
}

function BodyText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <p style={{ ...styles.bodyText, ...style }}>{children}</p>;
}

function ArticleList({ articles }: { articles: string[] }) {
  return (
    <div style={styles.articleList}>
      {articles.join(", ")}
    </div>
  );
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

/* ============================== */
/* Styles */
/* ============================== */

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
    lineHeight: 1.8,
    color: colors.deep,
  },

    sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 18,
    color: colors.ink,
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: 6,
    },

    block: {
    borderLeft: "3px solid #e5e7eb",
    paddingLeft: 16,
    marginBottom: 22,
    },

    cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 6,
    color: "#1f2937",
    },

  bodyText: {
    fontSize: 14,
    marginBottom: 8,
  },

    articleList: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 6,
    letterSpacing: "0.2px",
    },

  badge: {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: 6,
    fontSize: 11,
    marginTop: 6,
  },

  tableWrapper: {
    border: `1px solid ${colors.line}`,
    borderRadius: 10,
    overflow: "hidden",
  },

table: {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
},

th: {
  borderBottom: "1px solid #d1d5db",
  padding: "8px 10px",
  textAlign: "left",
  background: "#f9fafb",
},

td: {
  borderTop: "1px dotted #e5e7eb",
  padding: "8px 10px",
  verticalAlign: "top",
},
};

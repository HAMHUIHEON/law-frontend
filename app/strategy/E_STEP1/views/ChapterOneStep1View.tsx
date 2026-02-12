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
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: theme.accent,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
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
          <AuthorityBlock key={idx} variant="secondary">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <CardTitle>{p.title}</CardTitle>
              <EvidenceBadge status={p.evidenceStatus} />
            </div>
            <ArticleList articles={p.articles} />
            <BodyText>{p.meaning}</BodyText>
          </AuthorityBlock>
        ))}
      </CollapsibleSection>


      {/* AUTHORITY */}
      <CollapsibleSection title="🏛 권한·통제 구조">
        {data.authorities.map((a, idx) => (
          <AuthorityBlock key={idx} variant="primary">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <CardTitle>{a.topic}</CardTitle>
              <EvidenceBadge status={a.evidenceStatus} />
            </div>
            <ArticleList articles={a.articles} />
            <BodyText>{a.controlFunction}</BodyText>
          </AuthorityBlock>
        ))}
      </CollapsibleSection>



      {/* PROCEDURE */}
      <CollapsibleSection title="🔁 세무조사 절차">
        {data.procedureStages.map((s, idx) => (
          <ProcedureCard  key={idx}>
            <CardTitle>{s.stage}</CardTitle>
            <ArticleList articles={s.articles} />
            <BodyText>{s.keyControls}</BodyText>
            <EvidenceBadge status={s.evidenceStatus} />
          </ProcedureCard >
        ))}
      </CollapsibleSection>


      {/* TABLE */}
      <Section title="📊 조사 유형 비교">
        <div style={styles.tableWrapper}>
        <table style={styles.table}>
        <thead>
            <tr>
            <th style={{ ...styles.th, width: "10%" }}>구분</th>
            <th style={{ ...styles.th, width: "30%" }}>정의(요지)</th>
            <th style={{ ...styles.th, width: "18%" }}>근거권한(문언)</th>
            <th style={{ ...styles.th, width: "18%" }}>계획/통지 요건</th>
            <th style={{ ...styles.th, width: "24%" }}>비고</th>
            </tr>
        </thead>

        <tbody>
            {data.definitionTable.rows.map((row, idx) => (
            <tr key={idx}>
            <td style={{ ...styles.td, ...styles.categoryCell }}>
            <div
            style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontWeight: 600,
                letterSpacing: "2px",
            }}
            >
            {row.category}
            </div>
            </td>
                <td style={styles.td}>{row.definition}</td>
                <td style={styles.td}>{row.authority}</td>
                <td style={styles.td}>{row.noticeRequirement}</td>
                <td style={styles.td}>
                {row.notes}
                <div style={{ marginTop: 6 }}>
                    <EvidenceBadge status={row.evidenceStatus} />
                </div>
                
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
            <Card key={idx} variant="defense">
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


      {/* INTERNAL */}
      <CollapsibleSection title="⚙ 내부 운영 포인트">
        {data.internalOperations.map((i, idx) => (
            <Card key={idx} variant="internal">
            <CardTitle>{i.area}</CardTitle>
            <ArticleList articles={i.articles} />
            <BodyText>{i.implication}</BodyText>
            <EvidenceBadge status={i.evidenceStatus} />
          </Card>
        ))}
      </CollapsibleSection>


      {/* BRIDGE */}
      <CollapsibleSection title="🔎 다음 장으로 이어지는 질문">
        {data.bridgeQuestions.map((b, idx) => (
          <Card key={idx} variant="bridge">
            <CardTitle variant="bridge">
              {b.question}
            </CardTitle>
            <BodyText style={{ color: colors.muted, marginBottom: 12 }}>
              → {b.nextChapter}
            </BodyText>
            <BodyText>{b.why}</BodyText>
          </Card>
        ))}
      </CollapsibleSection>


      {/* EXTRA */}
      {/* {data.extraExplanations.length > 0 && ( */}
        {/* <CollapsibleSection title="📌 추가 설명">
          {data.extraExplanations.map((e, idx) => (
            <Card key={idx}>
              <CardTitle>{e.topic}</CardTitle>
              <BodyText>{e.reasonSeparated}</BodyText>
              <BodyText>{e.notes}</BodyText>
            </Card>
          ))}
        </CollapsibleSection>
      )} */}

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

function Card({
  children,
  variant = "defense",
}: {
  children: React.ReactNode;
  variant?: "defense" | "internal" | "bridge";
}) {
  const variantStyle =
    variant === "defense"
      ? styles.cardDefense
      : variant === "internal"
      ? styles.cardInternal
      : styles.cardBridge;

  return (
    <div style={{ ...styles.cardBase, ...variantStyle }}>
      {children}
    </div>
  );
}

function AuthorityBlock({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const variantStyle =
    variant === "secondary"
      ? styles.cardSecondary
      : styles.cardPrimary;

  return (
    <div style={{ ...styles.cardBase, ...variantStyle }}>
      {children}
    </div>
  );
}


function CardTitle({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "bridge";
}) {
  return (
    <h3
      style={
        variant === "bridge"
          ? styles.bridgeTitle
          : styles.cardTitle
      }
    >
      {variant === "bridge" && (
        <span style={styles.qMark}>Q.</span>
      )}
      {children}
    </h3>
  );
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
  const isValid = status === "근거 있음";

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        border: `1px solid ${isValid ? theme.success : theme.danger}`,
        color: isValid ? theme.success : theme.danger,
        background: "transparent",
      }}
    >
      {status}
    </span>
  );
}


function ProcedureCard({ children }: { children: React.ReactNode }) {
  return <div style={styles.procedureCard}>{children}</div>;
}

const design = {
  radius: 14,
  shadow: "0 4px 16px rgba(0,0,0,0.04)",
  border: "1px solid #e5e7eb",
  spacing: 24,
};

const theme = {
  bg: "#ffffff",
  bgSubtle: "#f8fafc",
  border: "#e2e8f0",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  accent: "#2563eb",       // 핵심 강조 색 하나만
  accentSoft: "#eff6ff",
  success: "#16a34a",
  danger: "#dc2626",
  radius: 12,
  shadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "40px 24px 120px",
    lineHeight: 1.8,
    color: theme.textPrimary,
  },


  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 24,
    color: theme.textPrimary,
    letterSpacing: "-0.3px",
  },

  summaryBox: {
    border: design.border,
    borderRadius: design.radius,
    padding: 24,
    background: "#fafafa",
  },

  summary: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#1f2937",
  },

  /* ============================= */
  /* 카드 공통 베이스 */
  /* ============================= */

  cardBase: {
    background: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius,
    padding: 28,
    marginBottom: 28,
    boxShadow: theme.shadow,
    transition: "all 0.15s ease",
  },

  cardPrimary: {
    background: theme.bg,
  },

  cardSecondary: {
    background: theme.bgSubtle,
  },

  cardDefense: {
    background: "#faf5ff",
  },

  cardInternal: {
    background: "#f0f9ff",
  },

  cardBridge: {
    background: theme.accentSoft,
  },

  procedureCard: {
    border: design.border,
    borderRadius: design.radius,
    padding: 24,
    marginBottom: 24,
    background: "#ffffff",
    boxShadow: design.shadow,
  },



cardTitle: {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 12,
  color: theme.textPrimary,
},

  bodyText: {
    fontSize: 14,
    marginBottom: 10,
    color: "#374151",
  },

":hover": {
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
},

  bridgeTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 16,
    color: "#92400e",
  },

  articleList: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
    letterSpacing: "0.3px",
  },

  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    marginTop: 8,
  },

  /* ============================= */
  /* 테이블 */
  /* ============================= */

  tableWrapper: {
    border: design.border,
    borderRadius: design.radius,
    overflow: "hidden",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },

  th: {
    padding: "14px",
    textAlign: "center",
    background: "#f9fafb",
    fontWeight: 600,
    borderBottom: "1px solid #e5e7eb",
  },

  td: {
    padding: "14px",
    borderTop: "1px solid #f1f5f9",
    verticalAlign: "top",
  },

  categoryCell: {
    background: "#fafafa",
    position: "relative",
    padding: 0,
    width: 70,
  },

  qMark: {
    marginRight: 8,
    fontWeight: 700,
  },
};

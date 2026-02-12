"use client";

import { ChapterOneStep1ViewModel } from "../types";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getStrategyAccess } from "../../../access";
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
  const style =
    variant === "defense"
      ? styles.defenseBlock
      : variant === "internal"
      ? styles.internalBlock
      : styles.bridgeBlock;

  return <div style={style}>{children}</div>;
}

function AuthorityBlock({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const style =
    variant === "secondary"
      ? styles.authorityBlock2
      : styles.authorityBlock;

  return <div style={style}>{children}</div>;
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

function ProcedureCard({ children }: { children: React.ReactNode }) {
  return <div style={styles.procedureCard}>{children}</div>;
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
    fontSize: 16,
    lineHeight: 1.9,
    color: "#1f2937",
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
    tableLayout: "auto",
    },


th: {
  borderBottom: "1px solid #d1d5db",
  padding: "12px 12px",
  textAlign: "center",
  verticalAlign: "middle",
  background: "#f9fafb",
  fontWeight: 600,
},

td: {
  borderTop: "1px dotted #e5e7eb",
  padding: "12px",
  lineHeight: 1.6,
  wordBreak: "keep-all",
},

categoryCell: {
  background: "#fafafa",
  position: "relative",
  padding: 0,
  width: "70px",
},

authorityBlock: {
  background: "#f8fafc",
  borderLeft: "4px solid #94a3b8",
  padding: "20px 22px",
  marginBottom: 28,
  position: "relative",
},

authorityBlock2: {
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "20px 22px",
  marginBottom: 28,
},

procedureCard: {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "20px 22px",
  marginBottom: 22,
  background: "#ffffff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
},

defenseBlock: {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "22px 24px",
  marginBottom: 26,
  background: "#ffffff",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
},

internalBlock: {
  background: "#f9fafb",
  borderRadius: 14,
  padding: "22px 24px",
  marginBottom: 24,
  border: "1px solid #f1f5f9",
},

bridgeBlock: {
  border: "1px dashed #d1d5db",
  borderRadius: 18,
  padding: "32px 36px",
  marginBottom: 36,
  background: "#fafafa",
},

bridgeTitle: {
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 16,
  color: "#111827",
  lineHeight: 1.6,
},

qMark: {
  marginRight: 8,
  fontWeight: 700,
  color: "#111827",
  display: "inline-block",
  transform: "translateY(-1px)",
},

};

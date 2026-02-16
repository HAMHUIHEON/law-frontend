"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getStrategyAccess } from "../../access";
import { Step2SectionViewModel } from "../types";

type Props = {
  bookId: string;
  chapter: "chapter1" | "chapter2" | "chapter3";
  sectionSlug: string;
  data: Step2SectionViewModel;
};

/* ====================================================== */
/* Color System (Step1 통일) */
/* ====================================================== */

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  bgSoft: "#fafafa",
};

/* ====================================================== */
/* View */
/* ====================================================== */

export default function SectionStep2View({
  bookId,
  chapter,
  sectionSlug,
  data,
}: Props) {
  const { userId } = useAuth();
  const userAccess = useUserAccessLevel();
  const access = getStrategyAccess(userAccess, "E_STEP2");
  const isLocked = access !== "FULL";
  const [showHint, setShowHint] = useState(false);

  const saveThought = useSaveThought();
  const [saving, setSaving] = useState(false);

  useRecordStrategyTrace({
    userId,
    parentType: "strategy",
    parentId: bookId,
    traceType: "reasoning",
    traceId: `E_STEP2:${chapter}:${sectionSlug}`,
  });

  if (isLocked) {
    return <CenterMessage>접근 권한이 필요합니다.</CenterMessage>;
  }

  return (
    <article style={styles.container}>
      {/* Floating Save */}
      <div style={styles.floatingWrap}>
        <button
          onClick={async () => {
            if (!userId || saving) return;
            setSaving(true);
            try {
              await saveThought({
                parentType: "strategy",
                parentId: bookId,
                targetType: "reasoning",
                targetId: `E_STEP2:${chapter}:${sectionSlug}`,
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

      <h1 style={styles.title}>{data.section}</h1>

      {/* L0 */}
      <LayerSection label="L0" title="상위 규범 연동 구조">
        {data.L0.normative_anchors.map((a, i) => (
          <ReportCard key={i}>
            <CardTitle>{a.external_article}</CardTitle>
            <Item label="법적 기능">{a.legal_function}</Item>
            <Item label="의존 유형">{a.dependency_type}</Item>
            <TagRow label="내부 연결 조문" items={a.internal_linkage} />
            <Item label="해석 한계">{a.interpretation_limit}</Item>
          </ReportCard>
        ))}
      </LayerSection>

      {/* L1 */}
      <LayerSection label="L1" title="적용 범위 및 구성 체계">
        <Paragraph>{data.L1.scope_statement}</Paragraph>

        {data.L1.components.map((c, i) => (
          <ReportCard key={i}>
            <CardTitle>{c.name}</CardTitle>
            <Paragraph>{c.description}</Paragraph>
            <TagRow label="근거 조문" items={c.legal_basis} />
          </ReportCard>
        ))}
      </LayerSection>

      {/* L2 */}
      <LayerSection label="L2" title="절차 작동 엔진">
        {data.L2.map((block) => (
          <div key={block.key} style={{ marginBottom: 40 }}>
            <CardTitle>{block.label}</CardTitle>

            {block.items.map((item, idx) => (
              <ReportCard key={idx}>
                <Item label="작동 메커니즘">
                  {item.mechanism_statement}
                </Item>

                <TagRow
                  label="내부 근거"
                  items={item.internal_legal_basis}
                />

                <TagRow
                  label="외부 근거"
                  items={item.external_legal_basis ?? []}
                />

                <Collapsible
                  title="위반 시 리스크"
                  content={item.failure_mode}
                />
              </ReportCard>
            ))}
          </div>
        ))}
      </LayerSection>

      {/* L3 */}
      <LayerSection label="L3" title="분쟁 및 방어 구조">
        {data.L3.dispute_points.items.map((d, i) => (
          <ReportCard key={i}>
            <CardTitle>{d.issue}</CardTitle>
            <Item label="납세자 주장">{d.positions.taxpayer}</Item>
            <Item label="과세관청 주장">
              {d.positions.tax_office}
            </Item>
            <TagRow label="핵심 증거" items={d.key_evidence} />
          </ReportCard>
        ))}

        {data.L3.system_tension && (
          <div style={styles.highlightBox}>
            <CardTitle>구조적 긴장</CardTitle>
            <Paragraph>
              {data.L3.system_tension.description}
            </Paragraph>
          </div>
        )}
      </LayerSection>
    </article>
  );
}

/* ====================================================== */
/* Components */
/* ====================================================== */

function LayerSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={styles.layerTitleWrapper}>
        <div style={styles.layerTitleBar} />
        <h2 style={styles.layerTitle}>
          {label}. {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function ReportCard({ children }: { children: React.ReactNode }) {
  return <div style={styles.card}>{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.cardTitleWrapper}>
      <div style={styles.cardTitleBar} />
      <h3 style={styles.cardTitle}>{children}</h3>
    </div>
  );
}

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p style={styles.item}>
      <strong style={styles.itemLabel}>{label}</strong>
      {children}
    </p>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p style={styles.paragraph}>{children}</p>;
}

function TagRow({
  label,
  items,
}: {
  label: string;
  items?: string[];
}) {
  if (!items?.length) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <span style={styles.articleList}>
        {label}: {items.join(", ")}
      </span>
    </div>
  );
}

function Collapsible({
  title,
  content,
}: {
  title: string;
  content?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!content) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={styles.toggleButton}
      >
        {open ? "접기 ▲" : `${title} ▼`}
      </button>

      {open && (
        <div style={styles.failureBox}>
          {content}
        </div>
      )}
    </div>
  );
}

function CenterMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 80, textAlign: "center" }}>
      {children}
    </div>
  );
}

/* ====================================================== */
/* Styles */
/* ====================================================== */

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 960,
    margin: "0 auto",
    paddingTop: 24,
    lineHeight: 1.7,
    color: colors.ink,
  },

  title: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 32,
  },

  layerTitleWrapper: {
    display: "flex",
    alignItems: "center",
    marginBottom: 18,
  },

  layerTitleBar: {
    width: 4,
    height: 18,
    background: "#1e3a8a",
    borderRadius: 2,
    marginRight: 10,
  },

  layerTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
  },

  card: {
    border: `1px solid ${colors.line}`,
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
    background: "#1e3a8a",
    borderRadius: 2,
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
  },

  paragraph: {
    fontSize: 14,
    marginBottom: 10,
  },

  item: {
    fontSize: 14,
    marginBottom: 8,
  },

  itemLabel: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 600,
    marginRight: 6,
    color: colors.muted,
  },

  articleList: {
    fontSize: 12,
    color: colors.muted,
  },

  highlightBox: {
    padding: 18,
    borderRadius: 10,
    background: colors.bgSoft,
    border: `1px solid ${colors.line}`,
    marginTop: 20,
  },

  failureBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 8,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    fontSize: 13,
  },

  toggleButton: {
    fontSize: 12,
    color: colors.muted,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },

  floatingWrap: {
    position: "fixed",
    right: 24,
    bottom: 160,
    zIndex: 60,
  },

  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    border: `1px solid ${colors.line}`,
    background: "#fff",
    fontSize: 20,
    cursor: "pointer",
  },
};

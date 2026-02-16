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
      <FloatingSaveButton
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
      />

      <h1 style={styles.title}>{data.section}</h1>

      <Layer
        label="L0"
        title="상위 규범 연동 구조"
      >
        {data.L0.normative_anchors.map((a, i) => (
          <ReportCard key={i}>
            <Item label="상위 법령">{a.external_article}</Item>
            <Item label="법적 기능">{a.legal_function}</Item>
            <Item label="의존 유형">{a.dependency_type}</Item>
            <TagRow label="내부 연결 조문" items={a.internal_linkage} />
            <Item label="해석 한계">{a.interpretation_limit}</Item>
          </ReportCard>
        ))}
      </Layer>

      <Layer
        label="L1"
        title="적용 범위 및 구성 체계"
      >
        <Paragraph>{data.L1.scope_statement}</Paragraph>

        {data.L1.components.map((c, i) => (
          <ReportCard key={i}>
            <CardTitle>{c.name}</CardTitle>
            <Paragraph>{c.description}</Paragraph>
            <TagRow label="근거 조문" items={c.legal_basis} />
          </ReportCard>
        ))}
      </Layer>

      <Layer
        label="L2"
        title="절차 작동 엔진"
      >
        {data.L2.map((block) => (
          <div key={block.key} style={{ marginBottom: 40 }}>
            <SubTitle>{block.label}</SubTitle>

            {block.items.map((item: any, idx: number) => (
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
      </Layer>

      <Layer
        label="L3"
        title="분쟁 및 방어 구조"
      >
        {data.L3.dispute_points.items.map((d, i) => (
          <ReportCard key={i}>
            <Item label="쟁점">{d.issue}</Item>
            <Item label="납세자 주장">{d.positions.taxpayer}</Item>
            <Item label="과세관청 주장">
              {d.positions.tax_office}
            </Item>
            <TagRow label="핵심 증거" items={d.key_evidence} />
          </ReportCard>
        ))}

        {data.L3.system_tension && (
          <HighlightBox>
            <SubTitle>구조적 긴장</SubTitle>
            <Paragraph>
              {data.L3.system_tension.description}
            </Paragraph>
          </HighlightBox>
        )}
      </Layer>
    </article>
  );
}

/* ============================= */
/* UI COMPONENTS */
/* ============================= */

function Layer({
  label,
  title,
  children,
}: any) {
  return (
    <section style={styles.layerSection}>
      <div style={styles.layerHeader}>
        <div style={styles.layerBar}>{label}</div>
        <h2 style={styles.layerTitle}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ReportCard({ children }: any) {
  return <div style={styles.card}>{children}</div>;
}

function CardTitle({ children }: any) {
  return <h3 style={styles.cardTitle}>{children}</h3>;
}

function SubTitle({ children }: any) {
  return <h3 style={styles.subTitle}>{children}</h3>;
}

function Item({ label, children }: any) {
  return (
    <p style={styles.item}>
      <strong style={styles.itemLabel}>{label}</strong>
      {children}
    </p>
  );
}

function Paragraph({ children }: any) {
  return <p style={styles.paragraph}>{children}</p>;
}

function TagRow({ label, items }: any) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <span style={styles.itemLabel}>{label}</span>
      <div>
        {items.map((t: string, i: number) => (
          <span key={i} style={styles.tag}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Collapsible({ title, content }: any) {
  const [open, setOpen] = useState(false);
  if (!content) return null;
  return (
    <div>
      <div
        style={styles.collapseToggle}
        onClick={() => setOpen(!open)}
      >
        {open ? "▼ " : "▶ "}
        {title}
      </div>
      {open && <div style={styles.failureBox}>{content}</div>}
    </div>
  );
}

function HighlightBox({ children }: any) {
  return <div style={styles.highlightBox}>{children}</div>;
}

function FloatingSaveButton({ onClick }: any) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div style={styles.floatingWrap}>
      <button
        onClick={onClick}
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
  );
}

function CenterMessage({ children }: any) {
  return (
    <div style={{ padding: 80, textAlign: "center" }}>
      {children}
    </div>
  );
}

/* ============================= */
/* STYLES */
/* ============================= */

const styles: Record<string, any> = {
  container: {
    maxWidth: 920,
    margin: "0 auto",
    paddingTop: 40,
    lineHeight: 1.9,
    color: "#111827",
  },

  title: {
    fontSize: 30,
    fontWeight: 700,
    marginBottom: 60,
    letterSpacing: "-0.3px",
  },

  layerSection: {
    marginBottom: 80,
  },

  layerHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: 28,
  },

  layerBar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    background: "#1e3a8a",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  layerTitle: {
    fontSize: 20,
    fontWeight: 700,
  },

  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 26,
    marginBottom: 28,
    background: "#ffffff",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 10,
  },

  subTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 12,
  },

  paragraph: {
    fontSize: 15,
    marginBottom: 12,
  },

  item: {
    marginBottom: 10,
  },

  itemLabel: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
    color: "#374151",
  },

  tag: {
    display: "inline-block",
    fontSize: 12,
    background: "#f3f4f6",
    padding: "4px 8px",
    borderRadius: 8,
    marginRight: 6,
    marginTop: 6,
  },

  highlightBox: {
    padding: 24,
    borderRadius: 14,
    background: "#fffbeb",
    border: "1px solid #fde68a",
  },

  collapseToggle: {
    cursor: "pointer",
    fontSize: 13,
    marginTop: 10,
    color: "#6b7280",
  },

  failureBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    background: "#fef2f2",
    border: "1px solid #fecaca",
  },

  floatingWrap: {
    position: "fixed",
    right: 30,
    bottom: 160,
    zIndex: 50,
  },

  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    fontSize: 20,
    cursor: "pointer",
  },
};

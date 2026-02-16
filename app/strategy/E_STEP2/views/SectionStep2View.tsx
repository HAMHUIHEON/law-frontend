"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getStrategyAccess } from "../../access";
import { Step2SectionViewModel } from "../types";
import React from "react";
const LayerColorContext = React.createContext<string>("#1e3a8a");

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

const layerColors: Record<string, string> = {
  L0: "#1e3a8a",
  L1: "#0f766e",
  L2: "#1e40af",
  L3: "#7c3aed",
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

  // 🔥 아직 로딩 중이면 아무 것도 렌더링 안 함
  if (!userAccess) {
    return <CenterMessage>불러오는 중...</CenterMessage>;
  }

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
      <StrategyNotice />
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


      <Divider />
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
      <Divider />

      {/* L2 */}

      <LayerSection label="L2" title="절차 작동 엔진">
        {data.L2.map((block) => (
          <div key={block.key} style={{ marginBottom: 40 }}>
            <CardTitle>{block.label}</CardTitle>

            {block.items.map((item, idx) => (
              <ReportCard key={idx}>
              <Item
                label="작동 메커니즘"
             >
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
      <Divider />
      {/* L3 */}
      <LayerSection
        label="L3"
        title="분쟁 및 방어 구조"
        hint="※ 아래 내용은 실제 사건에 대한 법적 판단이 아닌, 구조 이해를 위한 가상 분석입니다."
      >
        {data.L3.dispute_points.items.map((d, i) => (
          <ReportCard key={i}>
            <CardTitle>{d.issue}</CardTitle>
            <Item
              label="납세자 주장"
          >
              {d.positions.taxpayer}
            </Item>
            <Item label="과세관청 주장">
              {d.positions.tax_office}
            </Item>
            <TagRow label="핵심 증거" items={d.key_evidence} />
          </ReportCard>
        ))}

        {data.L3.system_tension && (
          <div style={styles.highlightBox}>
            <CardTitle>구조적 긴장</CardTitle>
            {splitIntoParagraphs(
              data.L3.system_tension.description
            ).map((p, i) => (
              <Paragraph
                key={i}
                style={{
                  fontWeight: i === 0 ? 500 : 400,
                  color: i === 0 ? colors.ink : undefined,
                }}
              >
                {p}
              </Paragraph>
            ))}


          </div>
        )}
      </LayerSection>
    </article>
  );
}

/* ====================================================== */
/* Components */
/* ====================================================== */
function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];

  const sentences = text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const paragraphs: string[] = [];

  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join(" "));
  }

  return paragraphs;
}

function StrategyNotice() {
  return (
    <div style={styles.noticeBox}>
      <p style={styles.noticeText}>
        📌 본 페이지의 내용은 법령 및 공개 자료를 기반으로 AI가
        구조적으로 재구성한 분석 자료입니다.
      </p>
      <p style={styles.noticeText}>
        특히 ‘위반 시 리스크’ 및 ‘분쟁·방어 구조’는 실제 사건에 대한
        법적 판단이 아니라, 연구 및 전략 시뮬레이션 목적의 가상 분석입니다.
      </p>
      <p style={styles.noticeText}>
        개별 사실관계에 대한 적용 가능성은 보장되지 않으며,
        구체적 사안에 대한 판단은 반드시 세무사·변호사 등 전문가의
        개별 자문을 통해 확인하시기 바랍니다.
      </p>
    </div>
  );
}

function Divider() {
  return <hr style={{ borderColor: colors.line, marginBottom: 24 }} />;
}

function LayerSection({
  label,
  title,
  hint,
  children,
}: {
  label: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const color = layerColors[label];

  return (
    <LayerColorContext.Provider value={color}>
      <section style={{ marginBottom: 56 }}>
        <div style={styles.layerTitleWrapper}>
          <div style={styles.layerTitleBar} />
          <h2 style={styles.layerTitle}>
            {label}. {title}
          </h2>
        </div>

        {hint && <p style={styles.sectionHint}>{hint}</p>}

        {children}
      </section>
    </LayerColorContext.Provider>
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
  const color = React.useContext(LayerColorContext);

  return (
    <div style={styles.itemRow}>
      <div
        style={{
          ...styles.itemBar,
          background: color,
        }}
      />
      <p style={styles.item}>
        <strong style={styles.itemLabel}>{label}</strong>
        {children}
      </p>
    </div>
  );
}

function Paragraph({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <p
      style={{
        ...styles.paragraph,
        ...style,
      }}
    >
      {children}
    </p>
  );
}


function TagRow({
  label,
  items,
}: {
  label: string;
  items?: string[];
}) {
  const color = React.useContext(LayerColorContext);

  if (!items?.length) return null;

  return (
    <div style={styles.itemRow}>
      <div
        style={{
          ...styles.itemBar,
          background: color,
        }}
      />
      <div style={{ marginBottom: 10 }}>
        <span style={styles.itemLabel}>{label}</span>
        <div>
          {items.map((t, i) => (
            <span key={i} style={styles.tag}>
              {t}
            </span>
          ))}
        </div>
      </div>
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
itemRow: {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  marginBottom: 12,
},

itemBar: {
  width: 4,
  borderRadius: 2,
  marginTop: 4,
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
  fontSize: 13,
  fontWeight: 600,
  marginRight: 6,
  color: "#374151",
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

tag: {
  display: "inline-block",
  fontSize: 12,
  background: "#f3f4f6",
  padding: "4px 8px",
  borderRadius: 8,
  marginRight: 6,
  marginTop: 6,
},
noticeBox: {
  border: `1px solid ${colors.line}`,
  background: colors.bgSoft,
  borderRadius: 12,
  padding: "16px 18px",
  marginBottom: 36,
},

noticeText: {
  fontSize: 12.5,
  lineHeight: 1.6,
  color: colors.muted,
  marginBottom: 6,
},
sectionHint: {
  fontSize: 12,
  lineHeight: 1.6,
  color: colors.muted,
  marginBottom: 18,
  paddingBottom: 8,
  borderBottom: `1px solid ${colors.line}`,
},

};
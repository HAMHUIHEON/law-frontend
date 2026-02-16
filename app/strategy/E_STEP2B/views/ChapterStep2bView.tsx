//29_FINAL/law-frontend/app/strategy/E_STEP2B/views/ChapterStep2bView.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getStrategyAccess } from "../../access";
import { Step2bChapterAnalysis } from "../types";
import React from "react";

type Props = {
  bookId: string;
  chapter: "chapter1" | "chapter2" | "chapter3";
  data: Step2bChapterAnalysis;
};

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  bgSoft: "#fafafa",
};

export default function ChapterStep2bView({
  bookId,
  chapter,
  data,
}: Props) {
  const { userId } = useAuth();
  const userAccess = useUserAccessLevel();

  if (!userAccess) {
    return null;
  }

  const access = getStrategyAccess(userAccess, "E_STEP2B");
  const isLocked = access !== "FULL";

  const saveThought = useSaveThought();
  const [saving, setSaving] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useRecordStrategyTrace({
    userId,
    parentType: "strategy",
    parentId: bookId,
    traceType: "reasoning",
    traceId: `E_STEP2B:${chapter}`,
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
                targetId: `E_STEP2B:${chapter}`,
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

      <h1 style={styles.title}>
        {data.chapter} 종합 구조 분석
      </h1>

      <StrategyNotice />

      {/* 아래부터 기존 L0/L2/L3 그대로 */}


      {/* ================= L0 ================= */}
      <LayerSection label="L0" title="상위 규범 의존 구조">
        {data.normative_dependency_map.map((item, idx) => (
          <ReportCard key={idx}>
            <CardTitle>{item.external_article}</CardTitle>

            <Item label="실체 구조" labelStyle={styles.labelFunction}>
              {item.substantive_structure}
            </Item>

            <Item label="의존 유형" labelStyle={styles.labelDependency}>
              {item.dependency_type}
            </Item>

            <Item label="해석 한계" labelStyle={styles.labelLimit}>
              {item.interpretation_limit}
            </Item>

            <TagRow
              label="연결 내부 메커니즘"
              items={item.linked_internal_mechanisms.map(
                (m) => `${m.section} (${m.layer})`
              )}
              labelStyle={styles.labelEvidence}
            />
          </ReportCard>
        ))}
      </LayerSection>

      <Divider />

      {/* ================= L2 ================= */}
      <LayerSection label="L2" title="실체적 판단 임계 구조">
        {data.substantive_threshold_analysis.map((item) => (
          <ReportCard key={item.external_article}>
            <CardTitle>{item.external_article}</CardTitle>

            <Item label="임계 유형" labelStyle={styles.labelFunction}>
              {item.threshold_type}
            </Item>

            <TagRow
              label="내부 트리거"
              items={item.internal_trigger_point.map(
                (m) => `${m.section} (${m.category})`
              )}
              labelStyle={styles.labelEvidence}
            />

            <Item label="에스컬레이션 경로" labelStyle={styles.labelDependency}>
              {item.escalation_path}
            </Item>

            <Collapsible title="리스크 메모" content={item.risk_note} />
          </ReportCard>
        ))}
      </LayerSection>

      <Divider />

      {/* ================= L3 ================= */}
      <LayerSection label="L3" title="리스크 에스컬레이션 맵">
        {data.risk_escalation_map.map((item, idx) => (
          <ReportCard key={idx}>
            <CardTitle>{item.stage}</CardTitle>

            <TagRow
              label="외부 규범"
              items={item.external_norm}
              labelStyle={styles.labelEvidence}
            />

            <TagRow
              label="내부 통제 지점"
              items={item.internal_control.map(
                (m) => `${m.section} (${m.layer})`
              )}
              labelStyle={styles.labelEvidence}
            />

            <Item label="에스컬레이션 조건" labelStyle={styles.labelFunction}>
              {item.escalation_condition}
            </Item>

            <Item label="시스템 리스크" labelStyle={styles.labelLimit}>
              {item.systemic_risk}
            </Item>

            <Item label="긴장 유형" labelStyle={styles.labelDependency}>
              {item.tension_type}
            </Item>
          </ReportCard>
        ))}
      </LayerSection>
    </article>
  );
}

/* ================= Components ================= */

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

function Divider() {
  return <hr style={{ borderColor: colors.line, marginBottom: 24 }} />;
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
  labelStyle,
}: {
  label: string;
  children: React.ReactNode;
  labelStyle?: React.CSSProperties;
}) {
  return (
    <p style={styles.item}>
      <span style={labelStyle ?? styles.labelBase}>{label}</span>
      {children}
    </p>
  );
}

function TagRow({
  label,
  items,
  labelStyle,
}: {
  label: string;
  items?: string[];
  labelStyle?: React.CSSProperties;
}) {
  if (!items?.length) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <span style={labelStyle ?? styles.labelBase}>{label}</span>
      <div>
        {items.map((t, i) => (
          <span key={i} style={styles.tag}>
            {t}
          </span>
        ))}
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
        <div style={styles.failureBox}>{content}</div>
      )}
    </div>
  );
}

function StrategyNotice() {
  return (
    <div style={styles.noticeBox}>
      <p style={styles.noticeText}>
        📌 본 페이지의 내용은 법령 및 공개 자료를 기반으로 AI가
        구조적으로 재구성한 분석 자료입니다.
      </p>
      <p style={styles.noticeText}>
        실제 사건에 대한 법적 판단이 아니라,
        연구 및 전략 시뮬레이션 목적의 가상 분석입니다.
      </p>
      <p style={styles.noticeText}>
        구체적 사안에 대한 판단은 반드시 전문가 자문을 통해 확인하시기 바랍니다.
      </p>
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


/* ================= Styles ================= */

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

  item: {
    fontSize: 14,
    marginBottom: 8,
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

  labelBase: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
  },

  labelFunction: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
    color: "#1e3a8a",
  },

  labelDependency: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
    color: "#0f766e",
  },

  labelEvidence: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
    color: "#7c3aed",
  },

  labelLimit: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
    color: "#b45309",
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

};

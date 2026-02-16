//E_step2/views/SectionStep2View.tsx

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

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  bgSoft: "#fafafa",
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
  const [showHint, setShowHint] = useState(false);

  useRecordStrategyTrace({
    userId,
    parentType: "strategy",
    parentId: bookId,
    traceType: "reasoning",
    traceId: `E_STEP2:${chapter}:${sectionSlug}`,
  });

  if (isLocked) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        접근 권한이 필요합니다.
      </div>
    );
  }

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
        >
          🔖
        </button>
      </div>

      <h1 style={styles.title}>{data.section}</h1>

      {/* 이하 기존 L0 ~ L3 렌더 그대로 유지 */}
      {/* (아래는 네 코드 그대로 둔다) */}

      {/* L0 */}
      <Block title="1. Normative Anchors (L0)">
        {data.L0.normative_anchors.map((a, idx) => (
          <Card key={idx}>
            <Row label="External Article" value={a.external_article} />
            <Row label="Legal Function" value={a.legal_function} />
            <Row label="Dependency Type" value={a.dependency_type} />
            <TagList label="Internal Linkage" items={a.internal_linkage} />
            <Paragraph
              label="Interpretation Limit"
              value={a.interpretation_limit}
            />
          </Card>
        ))}
      </Block>

      {/* L1 */}
      <Block title="2. Scope & Components (L1)">
        <Paragraph value={data.L1.scope_statement} />
        {data.L1.components.map((c, idx) => (
          <Card key={idx}>
            <CardTitle>{c.name}</CardTitle>
            <Paragraph value={c.description} />
            <TagList label="Legal Basis" items={c.legal_basis} />
          </Card>
        ))}
      </Block>

      {/* L2 */}
      <Block title="3. Procedural Engine (L2)">
        <EngineBlock title="Authority" block={data.L2.Authority} />
        <EngineBlock title="Trigger" block={data.L2.Trigger} />
        <EngineBlock title="Gate" block={data.L2.Gate} />
        <EngineBlock title="Notice" block={data.L2.Notice} />
        <EngineBlock title="Record" block={data.L2.Record_Form} />
        <EngineBlock title="Limits" block={data.L2.Limits} />
      </Block>

      {/* L3 */}
      <Block title="4. Litigation Layer (L3)">
        <DisputeBlock items={data.L3.dispute_points.items} />
        <DefenseBlock items={data.L3.defense_checklist.items} />
        <ArtifactBlock items={data.L3.ops_artifacts.items} />
        <SystemTensionBlock data={data.L3.system_tension} />
      </Block>
    </article>
  );
}


/* ===========================
   Sub Components
=========================== */

function Block({ title, children }: any) {
  return (
    <section
      style={{
        marginBottom: 56,
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: 32,
      }}
    >
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.row}>
      <strong>{label}:</strong> {value}
    </div>
  );
}

function Paragraph({ label, value }: { label?: string; value: string }) {
  return (
    <div style={styles.paragraph}>
      {label && <strong>{label}: </strong>}
      {value}
    </div>
  );
}

function TagList({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={styles.tagBlock}>
      <strong>{label}: </strong>
      <div style={styles.tagWrap}>
        {items.map((t, i) => (
          <span key={i} style={styles.tag}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function EngineBlock({ title, block }: any) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={styles.engineHeader}>
        <div style={styles.engineBar} />
        <h3 style={styles.engineTitle}>{title}</h3>
      </div>

      {block.items.map((item: any, idx: number) => (
        <CollapsibleCard key={idx} item={item} />
      ))}
    </div>
  );
}

function CollapsibleCard({ item }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div style={styles.card}>
      <div style={styles.row}>
        <strong>Mechanism:</strong> {item.mechanism_statement}
      </div>

      <TagList label="Internal Basis" items={item.internal_legal_basis} />
      {item.external_legal_basis?.length > 0 && (
        <TagList label="External Basis" items={item.external_legal_basis} />
      )}

      <div
        style={styles.failureToggle}
        onClick={() => setOpen(!open)}
      >
        {open ? "▼ Failure Mode" : "▶ Failure Mode"}
      </div>

      {open && (
        <div style={styles.failureBox}>
          {item.failure_mode}
        </div>
      )}
    </div>
  );
}

function DisputeBlock({ items }: any) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={styles.engineTitle}>Dispute Points</h3>
      {items.map((d: any, idx: number) => (
        <Card key={idx}>
          <Paragraph label="Issue" value={d.issue} />
          <Paragraph label="Taxpayer" value={d.positions.taxpayer} />
          <Paragraph label="Tax Office" value={d.positions.tax_office} />
          <TagList label="Key Evidence" items={d.key_evidence} />
        </Card>
      ))}
    </div>
  );
}


function DefenseBlock({ items }: any) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={styles.engineTitle}>Defense Checklist</h3>
      {items.map((d: any, idx: number) => (
        <Card key={idx}>
          <Paragraph value={d.check} />
          <Paragraph label="Why" value={d.why_it_matters} />
        </Card>
      ))}
    </div>
  );
}

function ArtifactBlock({ items }: any) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={styles.engineTitle}>Ops Artifacts</h3>
      {items.map((a: any, idx: number) => (
        <Card key={idx}>
          <Paragraph value={a.artifact} />
          <Paragraph label="Owner" value={a.owner} />
          <Paragraph label="Timing" value={a.timing} />
          <Paragraph label="Retention" value={a.retention} />
        </Card>
      ))}
    </div>
  );
}

function SystemTensionBlock({ data }: any) {
  if (!data) return null;

  return (
    <div style={styles.tensionBox}>
      <h3 style={styles.engineTitle}>System Tension</h3>
      <p>{data.description}</p>
      <TagList label="Internal Side" items={data.internal_side} />
      <TagList label="External Side" items={data.external_side} />
    </div>
  );
}

/* ===========================
   Styles
=========================== */

const styles: Record<string, any> = {
  container: {
    maxWidth: 960,
    margin: "0 auto",
    paddingTop: 18,
    lineHeight: 1.7,
    color: colors.ink,
},

  title: {
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 40,
  },
  section: {
    marginBottom: 60,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "20px 22px",
    marginBottom: 24,
    background: "#ffffff",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
  },
  row: {
    marginBottom: 8,
    lineHeight: 1.6,
  },
  paragraph: {
    marginBottom: 10,
    lineHeight: 1.7,
  },
  tagBlock: {
    marginBottom: 10,
  },
  tagWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  tag: {
    fontSize: 12,
    background: "#f3f4f6",
    padding: "3px 8px",
    borderRadius: 6,
  },
  engineTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 12,
  },

  failureToggle: {
    cursor: "pointer",
    fontSize: 13,
    color: "#374151",
    marginTop: 8,
  },

failureBox: {
  marginTop: 12,
  padding: 14,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
  fontSize: 14,
},

tensionBox: {
  padding: 20,
  borderRadius: 12,
  background: "#fef9c3",
  border: "1px solid #fde68a",
},


  engineHeader: {
  display: "flex",
  alignItems: "center",
  marginBottom: 16,
},

engineBar: {
  width: 4,
  height: 18,
  background: "#7c3aed", // 보라 (엔진 강조)
  borderRadius: 2,
  marginRight: 10,
},



};


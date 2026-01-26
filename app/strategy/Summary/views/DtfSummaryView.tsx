// law-frontend/app/strategy/Summary/views/DtfSummaryView.tsx

"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../../StrategyUIContext";
import {
  adaptDtfExecSummaryBlocks,
  DtfExecSummarySourceBlocksVM,
} from "../adapters/DividendTaxFraudBlocks.adapter";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  accent: "#6d28d9",
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export function DtfSummaryView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  const {
    selectedSummaryBlockId,
    setSelectedSummaryBlockId,
    setViewMode,
    setBriefPage,
  } = useStrategyUI();

  const [vm, setVm] = useState<DtfExecSummarySourceBlocksVM | null>(null);

  const [saving, setSaving] = useState(false);
  // 저장 버튼 클릭 핸들러
  const handleSaveSummary = async () => {
    if (!userId || !selectedSummaryBlockId || saving) return;
    setSaving(true); // saving 상태 시작
    try {
      await saveThought({
        parentType: "strategy",
        parentId: bookId,
        targetType: "semantic",  // 예: "reasoning"은 상황에 맞게 수정
        targetId: selectedSummaryBlockId, 
      });
    } finally {
      setSaving(false); // saving 상태 끝
    }
  };

  useEffect(() => {
    const run = async () => {
      const res = await fetch(
        `${API_BASE}/api/publications/a/${bookId}/exec-summary`
      );
      const json = await res.json();
      const adapted = adaptDtfExecSummaryBlocks(json);

      setVm(adapted);

      if (!selectedSummaryBlockId && adapted.blocks.length > 0) {
        setSelectedSummaryBlockId(adapted.blocks[0].blockId);
      }
    };

    run();
  }, [bookId, selectedSummaryBlockId, setSelectedSummaryBlockId]);

  if (!vm) {
    return <div style={{ padding: 48, color: colors.muted }}>불러오는 중…</div>;
  }

  const block = vm.blocks.find(
    (b) => b.blockId === selectedSummaryBlockId
  );

  if (!block) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        왼쪽에서 요약 블록을 선택하세요.
      </div>
    );
  }

  const s = block.oecd_report_cognitive_state;

  return (
            <>
        {/* 🔥 저장 버튼은 여기 */}
        <div style={{ position: "fixed", right: 24, bottom: 160, zIndex: 60 }}>
          {showHint && (
            <div
              style={{
                position: "absolute",
                bottom: 54,
                right: 0,
                padding: "6px 10px",
                borderRadius: 6,
                background: "#ffffff",
                color: "#111827",
                fontSize: 12,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              }}
            >
              저장
            </div>
          )}
    
          <button
            onClick={handleSaveSummary}
            disabled={saving}
            
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
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 20,
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all 120ms ease",
              opacity: saving ? 0.6 : 1,
            }}
          >
            🔖
          </button>
        </div>

    <article style={articleStyle}>
      {/* 원문 링크 */}
      <SourceLinkInline
        pageStart={block.pageRange.pageStart}
        pageEnd={block.pageRange.pageEnd}
        onOpen={(p) => {
          setBriefPage(p);
          setViewMode("BRIEFS");
        }}
      />

      <h1 style={h1Style}>{block.sectionTitle}</h1>
      <hr style={dividerStyle} />

      {/* 핵심 메시지 */}
      <Section title="핵심 메시지">
        <div
          style={{
            paddingLeft: 12,
            borderLeft: `3px solid ${colors.accent}`,
            fontSize: 15,
            lineHeight: 1.8,
          }}
        >
          {s.core_message}
        </div>
      </Section>

      {/* 주요 발견 */}
      <Section title="주요 발견">
        <CollapsibleBulletList items={s.key_findings} />
      </Section>

      {/* 작동 메커니즘 */}
      <Section title="작동 메커니즘">
        <CollapsibleBulletList items={s.mechanisms} />
      </Section>

      {/* 리스크 요인 */}
      <Section title="리스크 요인">
        <CollapsibleBulletList items={s.risk_factors} />
      </Section>

      {/* 제도적 요구사항 */}
      <Section title="제도적 요구사항">
        {s.requirements.map((r, i) => (
          <Card key={i} title={r.label}>
          {/* 미세 구분선 */}
          <div
            style={{
              borderTop: `1px dashed ${colors.line}`,
              margin: "10px 0",
            }}
          />

            <p style={{ marginBottom: r.sub_points.length ? 8 : 0,
             }}>
              {r.description}
            </p>
            {r.sub_points.length > 0 && (
              <BulletList items={r.sub_points} />
            )}
          </Card>
        ))}
      </Section>

      {/* 운영 요소 */}
      <Section title="운영 요소">
        {s.operational_elements.map((o, i) => (
          <Card key={i} title={o.label}>
            
            <p style={{ marginBottom: o.sub_points.length ? 8 : 0,
                      fontSize: 13, }}>
              {o.description}
            </p>
            <div
            style={{
              borderTop: `1px dashed ${colors.line}`,
              margin: "10px 0",
            }}
          />

            {o.sub_points.length > 0 && (
              <BulletList items={o.sub_points} />
            )}
          </Card>
        ))}
      </Section>

      {/* 협력 차원 */}
      <Section title="협력 차원">
        {s.cooperation_dimensions.map((c, i) => (
          <Card key={i} title={c.label}>
            <p style={{ marginBottom: c.sub_points.length ? 8 : 0,
              fontSize: 13,
             }}>
              {c.description}
            </p>

            <div
            style={{
              borderTop: `1px dashed ${colors.line}`,
              margin: "10px 0",
            }}
          />
            {c.sub_points.length > 0 && (
              <BulletList items={c.sub_points} />
            )}
          </Card>
        ))}
      </Section>

      {/* 실행상 도전 과제 */}
      <Section title="실행상 도전 과제">
        {s.implementation_challenges.map((ch, i) => (
          <Card key={i}>
            <p style={{ marginBottom: 6 }}>
              <strong>문제 양상</strong>: {ch.pattern}
            </p>
            <p style={{ marginBottom: 6 }}>
              <strong>영향</strong>: {ch.why_it_matters}
            </p>
            <BulletList items={ch.response} />
          </Card>
        ))}
      </Section>

      {/* 근거 자료 */}
      <Section title="근거 자료">
        <BulletList items={s.evidence_anchors} />
      </Section>
    </article>
    </>
  );
}

/* ================= 공통 컴포넌트 ================= */

function SourceLinkInline({
  pageStart,
  pageEnd,
  onOpen,
}: {
  pageStart: number;
  pageEnd: number;
  onOpen: (pageStart: number) => void;
}) {
  return (
    <button
      onClick={() => onOpen(pageStart + 1)}
      style={{
        marginBottom: 12,
        fontSize: 13,
        color: colors.accent,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      📄 원문 읽기 · p.{pageStart}–{pageEnd}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={h2Style}>{title}</h2>
      {children}
    </section>
  );
}

/* ================= 스타일 ================= */

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={cardStyle}>
      {title && <div style={cardTitleStyle}>{title}</div>}
      {children}
    </div>
  );
}

function BulletList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <ul style={ulStyle}>
      {items.map((i, idx) => (
        <li key={idx} style={{ marginBottom: 4 }}>
          {i}
        </li>
      ))}
    </ul>
  );
}
function CollapsibleBulletList({
  items,
  previewCount = 3,
}: {
  items: string[];
  previewCount?: number;
}) {
  const [open, setOpen] = useState(false);

  if (!items || items.length === 0) {
    return (
      <div style={{ fontSize: 14, color: colors.muted }}>
        내용이 제공되지 않았습니다.
      </div>
    );
  }

  const visibleItems = open ? items : items.slice(0, previewCount);
  const hasMore = items.length > previewCount;

  return (
    <>
      <BulletList items={visibleItems} />

      {hasMore && (
        <button
          onClick={() => setOpen(!open)}
          style={{
            marginTop: 6,
            fontSize: 13,
            color: "#6d28d9",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          {open ? "접기 ▲" : `더보기 (${items.length - previewCount}) ▼`}
        </button>
      )}
    </>
  );
}

/* ---------- styles ---------- */

const articleStyle: React.CSSProperties = {
  maxWidth: 960,
  paddingTop: 18,
  paddingBottom: 40,
  lineHeight: 1.7,
  color: colors.ink,
  fontSize: 14,
};

const h1Style: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  marginBottom: 12,
};

const h2Style: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 10,
};

const dividerStyle: React.CSSProperties = {
  borderColor: colors.line,
  marginBottom: 24,
};

const cardStyle: React.CSSProperties = {
  border: `1px solid ${colors.line}`,
  borderRadius: 8,
  padding: 14,
  marginBottom: 14,
  background: "#fafafa",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  marginBottom: 6,
};

const ulStyle: React.CSSProperties = {
  listStyleType: "disc",
  paddingLeft: 18,
  margin: "4px 0 0 0",
  fontSize: 13,
  color: "#374151",
};

const paraStyle: React.CSSProperties = {
  marginBottom: 6,
  color: "#374151",
};

// law-frontend/app/strategy/Summary/views/TcimSummaryView.tsx

"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../../StrategyUIContext";
import {
  adaptTcimExecSummaryBlocks,
  TcimExecSummarySourceBlocksVM,
  TcimModuleDesignStateJson,
} from "../adapters/TaxCrimeInvestigationManualBlocks.adapter";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
};

export function TcimSummaryView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  const {
    selectedSummaryBlockId,
    setSelectedSummaryBlockId,
    setViewMode,
    setBriefPage,
  } = useStrategyUI();

  const [vm, setVm] = useState<TcimExecSummarySourceBlocksVM | null>(null);

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
      const adapted = adaptTcimExecSummaryBlocks(json);

      setVm(adapted);

      if (!selectedSummaryBlockId && adapted.blocks.length > 0) {
        setSelectedSummaryBlockId(adapted.blocks[0].blockId);
      }
    };

    run();
  }, [bookId, selectedSummaryBlockId, setSelectedSummaryBlockId]);

  if (!vm) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        요약을 불러오는 중…
      </div>
    );
  }

  if (!selectedSummaryBlockId) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        왼쪽에서 요약 블록을 선택하세요.
      </div>
    );
  }

  const block = vm.blocks.find(
    (b) => b.blockId === selectedSummaryBlockId
  );

  if (!block) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        선택한 블록을 찾을 수 없습니다.
      </div>
    );
  }

  const m = block.module_design_state;

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

    <article
      style={{
        maxWidth: 960,
        paddingTop: 18,
        paddingBottom: 40,
        lineHeight: 1.7,
        color: colors.ink,
        fontSize: 14,
      }}
    >
    {/* 원문 링크 */}
    <SourceLinkInline
    pageStart={block.pageRange.pageStart}
    pageEnd={block.pageRange.pageEnd}
    onOpen={(pageStart) => {
        setBriefPage(pageStart);
        setViewMode("BRIEFS");
    }}
    />

      <h1 style={h1Style}>{block.sectionTitle}</h1>
      <hr style={dividerStyle} />

      {/* ===== Module Role ===== */}
      <Section title="수사 체계 내 역할과 기능">
        <p>{m.module_role_in_investigation_lifecycle}</p>
      </Section>

      {/* ===== Objectives ===== */}
      <Section title="운영 목표">
        <CollapsibleBulletList
          items={m.operational_objectives_for_module}
          previewCount={3}
        />
      </Section>

      {/* ===== Must-have subsections ===== */}
      <Section title="매뉴얼 필수 구성 요소">
        {m.must_have_subsections_in_manual.map((s, i) => (
          <Card key={i} title={s.name}>
        <p style={{ marginBottom: 10 ,fontWeight:500}}>{s.purpose}</p>
            <BulletList items={s.typical_content} />
          </Card>
        ))}
      </Section>

      {/* ===== Key procedures ===== */}
      <Section title="핵심 절차 · 의사결정 흐름">
        {m.key_procedures_or_decision_flows.map((p, i) => (
          <Card key={i} title={p.label}>
            <p>{p.description}</p>

            {p.trigger_or_entry_conditions && (
              <>
                <StrongLabel>개시 조건</StrongLabel>
                <BulletList items={p.trigger_or_entry_conditions} />
              </>
            )}

            {p.main_steps && (
              <>
                <StrongLabel>주요 단계</StrongLabel>
                <BulletList items={p.main_steps} />
              </>
            )}

            {p.outputs_or_decisions && (
              <>
                <StrongLabel>산출물 / 결정</StrongLabel>
                <BulletList items={p.outputs_or_decisions} />
              </>
            )}
          </Card>
        ))}
      </Section>

      {/* ===== Internal stakeholders ===== */}
      <Section title="내부 이해관계자와 책임">
        {m.internal_stakeholders_and_responsibilities.map((s, i) => (
          <Card key={i} title={s.actor}>

          {/* 미세 구분선 */}
          <div
            style={{
              borderTop: `1px dashed ${colors.line}`,
              margin: "1px 0",
            }}
          />
            <StrongLabel>주요 책임</StrongLabel>
            <BulletList items={s.responsibilities} />
            <StrongLabel>협업 지점</StrongLabel>
            <BulletList items={s.typical_points_of_interaction} />
          </Card>
        ))}
      </Section>

      {/* ===== External stakeholders ===== */}
      <Section title="외부 기관과의 협업">
        {m.external_stakeholders_and_interfaces.map((e, i) => (
          <Card key={i} title={e.counterpart}>
            <p>{e.purpose}</p>
            {/* 미세 구분선 */}
          <div
            style={{
              borderTop: `1px dashed ${colors.line}`,
              margin: "10px 0",
            }}
          />

            <StrongLabel>교환 정보</StrongLabel>
            <BulletList items={e.information_exchanged} />
            <StrongLabel>조정 리스크</StrongLabel>
            <BulletList items={e.coordination_risks} />
          </Card>
        ))}
      </Section>

      {/* ===== National variations ===== */}
      <Section title="국가별 제도 요소">
        {m.legitimate_national_variations.map((v, i) => (
          <Card key={i} title={v.dimension}>
          {/* 미세 구분선 */}
          <div
            style={{
              borderTop: `1px dashed ${colors.line}`,
              margin: "10px 0",
            }}
          />
            <p>{v.justification}</p>
          </Card>
        ))}
      </Section>

      {/* ===== Risks ===== */}
      <Section title="기능 부재·취약으로 인한 위험">
        {m.risks_if_module_is_weak_or_missing.map((r, i) => (
          <Card key={i}>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>
            {r.risk_description}</p>

          {/* 미세 구분선 */}
          <div
            style={{
              borderTop: `1px dashed ${colors.line}`,
              margin: "10px 0",
            }}
          />

            <StrongLabel>실패 유형</StrongLabel>
            <BulletList items={r.typical_failure_modes} />
            <StrongLabel>후속 영향</StrongLabel>
            <BulletList items={r.downstream_consequences} />
          </Card>
        ))}
      </Section>

      {/* ===== Deferred questions ===== */}
      <Section title="추후 정책 판단 과제">
        {m.deferred_policy_questions.map((q, i) => (
          <Card key={i}>
            <p style={{ marginBottom: 10 }}>
                  <strong>향후 검토:</strong> {q.question}
            </p>
            <p>
              <strong>검토 사유:</strong> {q.reason_for_deferral}
            </p>
            <p>
            </p>
          </Card>
        ))}
      </Section>
    </article>
          </>
  );
}

/* ---------- UI helpers ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40  }}>
      <h2 style={h2Style}>{title}</h2>
      {children}
    </section>
  );
}

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
        <li key={idx} 
          style={{
            marginBottom: 4,
            fontSize: 13,        // ← 여기
            lineHeight: 1.55,    // ← 같이 주면 가독성 좋아짐
            color: "#374151",    // (선택) 본문보다 살짝 옅게
          }}>
          {i}
        </li>
      ))}
    </ul>
  );
}
function BulletList2({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <ul style={ulStyle}>
      {items.map((i, idx) => (
        <li key={idx} 
        style={{ marginBottom: 4,  }}>
          {i}
        </li>
      ))}
    </ul>
  );
}


function StrongLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontWeight: 600, marginTop: 10, marginBottom: 4 }}>
      {children}
    </div>
  );
}

/* ---------- styles ---------- */

const sourceLinkStyle: React.CSSProperties = {
  marginBottom: 12,
  fontSize: 13,
  color: "#6d28d9",
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
};

const dividerStyle: React.CSSProperties = {
  borderColor: colors.line,
  marginBottom: 24,
};

const h1Style: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  marginBottom: 12,
};

const h2Style: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 600,
  marginBottom: 12,
};

const cardStyle: React.CSSProperties = {
  border: `1px solid ${colors.line}`,
  borderRadius: 8,
  padding: 16,
  marginBottom: 32,
  background: "#fafafa",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  marginBottom: 6,
};

const ulStyle: React.CSSProperties = {
  listStyleType: "disc",
  paddingLeft: 18,
  margin: "4px 0 0 0",
};
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
      onClick={() => onOpen(pageStart + 1)} // ✅ 여기서 offset 처리
      style={{
        marginTop: 8,
        fontSize: 13,
        color: "#6d28d9",
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
      <BulletList2 items={visibleItems} />

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

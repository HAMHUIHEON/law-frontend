// law-frontend/app/strategy/Summary/views/TciMmSummaryView.tsx

"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../../StrategyUIContext";
import {
  adaptTciMmExecSummaryBlocks,
  TciMmExecSummarySourceBlocksVM,
} from "../adapters/TaxCrimeInvestigationMaturityModelBlocks.adapter";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  accent: "#6d28d9",
};

export function TciMmSummaryView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  const {
    selectedSummaryBlockId,
    setSelectedSummaryBlockId,
    setViewMode,
    setBriefPage,
  } = useStrategyUI();

  const [vm, setVm] = useState<TciMmExecSummarySourceBlocksVM | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    let cancelled = false;

    const run = async () => {
      try {
        setError(null);

        const res = await fetch(
          `${API_BASE}/api/publications/a/${bookId}/exec-summary`
        );
        if (!res.ok) {
          throw new Error(`exec-summary 요청 실패 (${res.status})`);
        }

        const json = await res.json();
        const adapted = adaptTciMmExecSummaryBlocks(json);
        if (cancelled) return;

        setVm(adapted);
        if (!selectedSummaryBlockId && adapted.blocks.length > 0) {
          setSelectedSummaryBlockId(adapted.blocks[0].blockId);
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "데이터 로딩 오류");
        setVm(null);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [bookId, selectedSummaryBlockId, setSelectedSummaryBlockId]);

  if (error || !vm || !selectedSummaryBlockId) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        {error ?? "요약을 불러오는 중…"}
      </div>
    );
  }

  const block = vm.blocks.find((b) => b.blockId === selectedSummaryBlockId);
  if (!block) {
    return <div style={{ padding: 48 }}>선택한 블록을 찾을 수 없습니다.</div>;
  }

  const m = block.maturityModel;

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
        margin: "0 auto",
        padding: "24px 28px 48px",
        fontSize: 14,
        lineHeight: 1.7,
        color: colors.ink,
        background: "#fff",
      }}
    >
      <SourceLinkInline
        pageStart={block.pageRange.pageStart}
        pageEnd={block.pageRange.pageEnd}
        onOpen={(p) => {
          setBriefPage(p);
          setViewMode("BRIEFS");
        }}
      />

      <header
        style={{
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          {block.sectionTitle}
        </h1>
      </header>

      <Section title="핵심 요약">
        <p style={{ fontSize: 15, fontWeight: 500 }}>{m.core_message}</p>
      </Section>
      <Divider />

      <Section title="현행 제도에 대한 진단">
        <CollapsibleBulletList items={m.state_of_understanding} />
      </Section>

      <OptionalSection title="기본 법제 요건" items={m.requirements} />
      <OptionalSection title="제도 운영 요소" items={m.operational_elements} />
      <OptionalSection title="개선·이행 조치" items={m.implementation_measures} />
      <OptionalSection title="제도적 리스크" items={m.risk_factors} />
      <OptionalSection title="제도·설계 선택지" items={m.design_options} />
      <OptionalSection title="정책적 재량" items={m.legitimate_variations} />
      <OptionalSection title="추후 검토 과제" items={m.deferred_questions} />
      <OptionalSection title="제도 점검 체크리스트" items={m.notes_for_self_assessment} />
    </article>
          </>
  );
}


function OptionalSection({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <>
      <Divider />
      <Section title={title}>
        <CollapsibleBulletList items={items} />
      </Section>
    </>
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
    <section style={{ marginTop: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        {/* 컬러 포인트 바 */}
        <div
          style={{
            width: 4,
            height: 20,
            background: colors.accent,
            borderRadius: 2,
            flexShrink: 0,
          }}
        />

        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.01em",
            color: colors.ink,
          }}
        >
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: colors.line,
        margin: "24px 0",
      }}
    />
  );
}

function SourceLinkInline({
  pageStart,
  pageEnd,
  onOpen,
}: {
  pageStart: number;
  pageEnd: number;
  onOpen: (page: number) => void;
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

function CollapsibleBulletList({
  items,
  previewCount = 3,
}: {
  items?: string[];
  previewCount?: number;
}) {
  const [open, setOpen] = useState(false);
  if (!items || items.length === 0) return null;

  const visible = open ? items : items.slice(0, previewCount);
  const hasMore = items.length > previewCount;

  return (
    <>
      <ul
        style={{
          listStyleType: "disc",   // ✅ 이 줄이 핵심
          paddingLeft: 18,
          margin: 0,
          marginBottom: 7,
          fontSize: 14,
          lineHeight: 1.9,
        }}
      >
        {visible.map((i, idx) => (
          <li key={idx} style={{ marginBottom: 6 }}>
            {i}
            </li>
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={() => setOpen(!open)}
          style={{
            marginTop: 6,
            fontSize: 13,
            color: colors.accent,
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

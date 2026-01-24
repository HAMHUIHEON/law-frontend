// law-frontend/app/strategy/Summary/SummaryView.tsx

"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../StrategyUIContext";
import { adaptExecSummary, ExecSummaryVM } from "./adapters";
import { useStep2Index, resolvePageRange } from "./useStep2Index";
import { BOSummaryView } from "./views/BOview";
import { NatSummaryView } from "./views/NatSummaryView";
import { TcimSummaryView } from "./views/TcimSummaryView";
import { DtfSummaryView } from "./views/DtfSummaryView";
import { EsgSummaryView } from "./views/EsgSummaryView";
import { FatfSummaryView } from "./views/FatfSummaryView";
import { FtcSummaryView } from "./views/FtcSummaryView";
import { Pillar2SummaryView } from "./views/Pillar2SummaryView";
import { TciMmSummaryView } from "./views/TciMmSummaryView";

import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";


const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  deep: "#4c5159ff",
};



export function SummaryView({ bookId }: { bookId: string }) {
  // ✅ 2) 나머지 책들은 기존 공통 SummaryView 로직 그대로 사용
  const { userId } = useAuth();
  const { selectedSummaryBlockId, setViewMode, setBriefPage } =
    useStrategyUI();
  const [vm, setVm] = useState<ExecSummaryVM | null>(null);
  const { index: sectionIndex } = useStep2Index(bookId);
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

    useRecordStrategyTrace({
    userId,
    parentType: "strategy",  
    parentId: bookId,
    traceType: "semantic",
    traceId: selectedSummaryBlockId,
  });

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


  
  // ✅ 1) BO 책이면 여기서 바로 BO 전용 뷰로 넘긴다.
  if (bookId === "Best-Practices-Beneficial-Ownership-Legal-Persons") {
    return <BOSummaryView bookId={bookId} />;
  }
    if (bookId === "Desigining_a_National_Strategy_against_Tax_Crime") {
    return <NatSummaryView bookId={bookId} />;
  }

    if (bookId === "Designing_a_tax_crime_investigation_manual") {
    return <TcimSummaryView bookId={bookId} />;
  }

    if (bookId === "dividend_tax_fraud") {
    return <DtfSummaryView bookId={bookId} />;
  }

    if (bookId === "end shell game") {
    return <EsgSummaryView bookId={bookId} />;
  }

    if (bookId === "FATF Recommendations 2012.pdf.coredownload.inline") {
    return <FatfSummaryView bookId={bookId} />;
  }
    if (bookId === "Fighting_Tax_Crime-2nd_edition") {
    return <FtcSummaryView bookId={bookId} />;
  }

    if (bookId === "pillar2") {
    return <Pillar2SummaryView bookId={bookId} />;
  }

      if (bookId === "tax-crime-investigation-maturity-model") {
    return <TciMmSummaryView bookId={bookId} />;
  }


  useEffect(() => {
    const run = async () => {
      const res = await fetch(
        `http://127.0.0.1:8000/api/publications/a/${bookId}/exec-summary`
      );
      const raw = await res.json();
      setVm(adaptExecSummary(raw));
    };
    run();
  }, [bookId]);

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

  const pageRange =
    sectionIndex && block.sourceRange
      ? resolvePageRange(block.sourceRange, sectionIndex)
      : null;

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
        lineHeight: 1.8,
        color: colors.ink,
      }}
    >
      {/* 원문 참고 */}
      {pageRange && (
        <SourceLinkInline
          pageStart={pageRange.pageStart}
          pageEnd={pageRange.pageEnd}
          onOpen={(pageStart) => {
            setBriefPage(pageStart);
            setViewMode("BRIEFS");
          }}
        />
      )}

      {/* Key Findings */}
      <Section title="핵심 발견">
        <BulletList items={block.keyFindings} />
      </Section>

      {/* Cross-cutting risks */}
      <Section title="구조적·교차 리스크">
        <BulletList items={block.crossCuttingRisks} />
      </Section>

      {/* Strategic implications */}
      <Section title="전략적 시사점">
        {block.strategicImplications.map((s) => (
          <div key={s.key} style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {s.label}
            </div>

            <BulletList items={s.items} />
          </div>
        ))}
      </Section>

      {/* Priority focus */}
      <Section title="우선 집중 영역">
        <BulletList items={block.priorityFocusAreas} />
      </Section>
    </article>
          </>
  );
}

/* ---------- 작은 문서용 UI 헬퍼 ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return (
      <div style={{ fontSize: 14, color: colors.muted }}>
        내용이 제공되지 않았습니다.
      </div>
    );
  }

  return (
    <ul
      style={{
        listStyleType: "disc",
        paddingLeft: 18,
        margin: 0,
      }}
    >
      {items.map((item, idx) => (
        <li
          key={idx}
          style={{
            marginBottom: 10,
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

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
      onClick={() => onOpen(pageStart)}
      style={{
        marginTop: 8, // 기존 인라인에 있던 것만 유지
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

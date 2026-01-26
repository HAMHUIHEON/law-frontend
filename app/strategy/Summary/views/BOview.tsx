// law-frontend/app/strategy/Summary/views/BOSummaryView.tsx

"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../../StrategyUIContext";
import {
  adaptBoExecSummaryBlocks,
  BoExecSummarySourceBlocksVM,
  BoBestPracticeJson,
  BoCountryExampleJson,
  BoChallengeJson,
} from "../adapters/BestPracticesBOBlocks.adapter";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  deep: "#4c5159ff",
};

interface BOSummaryViewProps {
  bookId: string;
}
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export function BOSummaryView({ bookId }: BOSummaryViewProps) {
  const { userId } = useAuth();
  const saveThought = useSaveThought();
  const [showHint, setShowHint] = useState(false);

  const {
    selectedSummaryBlockId,
    setSelectedSummaryBlockId,
    setViewMode,
    setBriefPage,
  } = useStrategyUI();

  const [vm, setVm] = useState<BoExecSummarySourceBlocksVM | null>(
    null
  );
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
          throw new Error(
            `exec-summary 요청 실패 (status: ${res.status})`
          );
        }

        const raw = await res.json();
        const adapted = adaptBoExecSummaryBlocks(raw);

        if (cancelled) return;

        setVm(adapted);

        // ✅ 아직 선택된 블록이 없으면 첫 블록 자동 선택
        if (
          !selectedSummaryBlockId &&
          adapted.blocks &&
          adapted.blocks.length > 0
        ) {
          setSelectedSummaryBlockId(adapted.blocks[0].blockId);
        }
      } catch (e: any) {
        if (cancelled) return;
        console.error(e);
        setError(
          e instanceof Error
            ? e.message
            : "exec-summary 데이터를 불러오는 중 오류가 발생했습니다."
        );
        setVm(null);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [bookId, selectedSummaryBlockId, setSelectedSummaryBlockId]);

  // 로딩/에러 처리
  if (error) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        BO 요약을 불러오는 중 오류가 발생했습니다:
        <br />
        <span style={{ fontSize: 13 }}>{error}</span>
      </div>
    );
  }

  if (!vm) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        요약을 불러오는 중…
      </div>
    );
  }
  if (!selectedSummaryBlockId) {
    // 이 경우는 거의 안 오겠지만, 안전망으로 유지
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

  const pageRange = block.pageRange; // 어댑터에서 이미 가공됨

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
      {/* Section title */}
      <h1
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {block.sectionTitle}
      </h1>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* 핵심 메시지 */}
      <Section title="핵심 메시지">
      <CollapsibleBulletList items={block.coreMessages} />
       </Section>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />
      
      {/* 모범 관행 */}
      {block.bestPractices.length > 0 && (
        <>
          <Section title="모범 관행">
            {block.bestPractices.map((bp, idx) => (
              <BestPracticeCard key={idx} bp={bp} />
            ))}
          </Section>

          <hr style={{ borderColor: colors.line, marginBottom: 24 }} />
        </>
      )}


      {/* 정책적 근거 */}
      <Section title="정책적 근거">
      <CollapsibleBulletList items={block.policyRationales} />
      </Section>
      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />


      {/* 이행 수단 */}
      <Section title="이행 수단">
        <CollapsibleBulletList items={block.implementationMeasures} />
      </Section>
      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* 위험 요인 */}
      <Section title="리스크 요인">
        <CollapsibleBulletList items={block.riskFactors} />
      </Section>
      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* 주요 도전 과제 */}
      {block.challenges.length > 0 && (
        <>
          <Section title="주요 도전 과제">
            {block.challenges.map(
              (ch: BoChallengeJson, idx: number) => (
                <ChallengeCard key={idx} ch={ch} />
              )
            )}
          </Section>

          <hr style={{ borderColor: colors.line, marginBottom: 24 }} />
        </>
      )}


      {/* 국가별 사례 */}
      {block.countryExamples.length > 0 && (
        <Section title="국가별 사례">
          {block.countryExamples.map(
            (ex: BoCountryExampleJson, idx: number) => (
              <div
                key={idx}
                style={{ marginBottom: 10, fontSize: 14 }}
              >
                <strong>{ex.country}</strong>: {ex.summary}
              </div>
            )
          )}
        </Section>
      )}

      {/* 국제 기준 및 참조 */}
      <Section title="국제 기준 및 참조">
        <BulletList items={block.internationalReferences} />
      </Section>
      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />


      {/* 향후 검토 과제 */}
      <Section title="향후 검토 과제">
        <BulletList items={block.deferredIssues} />
      </Section>
    </article>
      </>
  );
}

/* ---------- 작은 문서용 UI 헬퍼 ---------- */
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
      onClick={() => onOpen(pageStart+2)}
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

function BestPracticeCard({ bp }: { bp: BoBestPracticeJson }) {
  return (
    <div
      style={{
        border: `1px solid ${colors.line}`,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        background: "#fafafa",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 12,
          borderBottom: `1px dashed ${colors.line}`,
          paddingBottom: 6,
        }}
      >
        {bp.label}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 14,
          marginBottom: bp.sub_points.length ? 10 : 0,
          color: colors.ink,
        }}
      >
        {bp.description}
      </div>

      {/* Sub points */}
      {bp.sub_points.length > 0 && (
        <ul
          style={{
            paddingLeft: 18,
            margin: 0,
            listStyleType: "disc",
            fontSize: 14,
          }}
        >
          {bp.sub_points.map((sp, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>
              {sp}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChallengeCard({ ch }: { ch: BoChallengeJson }) {
  return (
    <div
      style={{
        border: `1px solid ${colors.line}`,
        borderRadius: 8,
        padding: 16,
        marginBottom: 32,
        background: "#fafafa",
      }}
    >
      {/* Pattern */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 6,

        }}
      >
        문제 패턴
      </div>

      <div
        style={{
          fontSize: 14,
          marginBottom: 12,
          color: colors.ink,
          borderBottom: `1px dashed ${colors.line}`,
          paddingBottom: 6,

        }}
      >
        {ch.pattern}
      </div>

      {/* Responses */}
      {ch.response.length > 0 && (
        <>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            대응 방안
          </div>

          <ul
            style={{
              paddingLeft: 18,
              listStyleType: "disc",
              fontSize: 14,

            }}
          >
            {ch.response.map((r, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>
                {r}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

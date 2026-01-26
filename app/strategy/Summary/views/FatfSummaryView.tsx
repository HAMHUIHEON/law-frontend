// law-frontend/app/strategy/Summary/views/FatfSummaryView.tsx

"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../../StrategyUIContext";
import {
  adaptFatfRecommendationsExecSummaryBlocks,
  FatfExecSummarySourceBlocksVM,
} from "../adapters/FatfRecommendations2012Blocks.adapter";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  accent: "#6d28d9",
};

export function FatfSummaryView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  const saveThought = useSaveThought();
  const [showHint, setShowHint] = useState(false);

  const {
    selectedSummaryBlockId,
    setSelectedSummaryBlockId,
    setViewMode,
    setBriefPage,
  } = useStrategyUI();

  const [vm, setVm] = useState<FatfExecSummarySourceBlocksVM | null>(null);
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
          throw new Error(`exec-summary 요청 실패 (status: ${res.status})`);
        }

        const json = await res.json();
        const adapted = adaptFatfRecommendationsExecSummaryBlocks(json);

        if (cancelled) return;

        setVm(adapted);

        if (!selectedSummaryBlockId && adapted.blocks.length > 0) {
          setSelectedSummaryBlockId(adapted.blocks[0].blockId);
        }
      } catch (e: any) {
        if (cancelled) return;
        console.error(e);
        setError(
          e instanceof Error
            ? e.message
            : "데이터 로딩 중 오류가 발생했습니다."
        );
        setVm(null);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [bookId, selectedSummaryBlockId, setSelectedSummaryBlockId]);

  if (error) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        요약을 불러오는 중 오류가 발생했습니다:
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
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        왼쪽에서 요약 블록을 선택하세요.
      </div>
    );
  }

  const block = vm.blocks.find((b) => b.blockId === selectedSummaryBlockId);
  if (!block) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        선택한 블록을 찾을 수 없습니다.
      </div>
    );
  }

  const s = block.cognitiveState;

  const hasAny =
    !!s.coreMessage ||
    s.riskAndPolicyFocus.length > 0 ||
    s.scopeAndCoverage.length > 0 ||
    s.minimumRequiredMeasures.length > 0 ||
    s.implementationMechanisms.length > 0 ||
    s.supervisionAndEnforcement.length > 0 ||
    s.flexibilityAndNationalDiscretion.length > 0 ||
    s.typicalGapsOrFailureModes.length > 0 ||
    s.implementationChallenges.length > 0 ||
    s.crossReferenceAndDependencies.length > 0 ||
    s.notesForReaders.length > 0;

  if (!hasAny) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        표시할 요약 정보가 없습니다.
      </div>
    );
  }

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
      {/* 📄 원문 링크 – 네가 준 패턴 + offset(+1) 고정 */}
      <SourceLinkInline
        pageStart={block.pageRange.pageStart}
        pageEnd={block.pageRange.pageEnd}
        onOpen={(pageStart) => {
          setBriefPage(pageStart);
          setViewMode("BRIEFS");
        }}
      />

      {/* 제목 + 메타 */}
      <div style={{ marginBottom: 16 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: 0,
            marginBottom: 4,
          }}
        >
          {block.sectionTitle}
        </h1>
        <div style={{ fontSize: 12, color: colors.muted }}></div>
      </div>

      <Divider />

      {/* 1. 하이라이트 박스 하나만 사용 */}
      {(s.coreMessage || s.riskAndPolicyFocus.length > 0) && (
        <HighlightBox>
          {s.coreMessage && (
            <p
              style={{
                margin: 0,
                marginBottom: s.riskAndPolicyFocus.length ? 15 : 0,
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.8,
              }}
            >
              {s.coreMessage}
            </p>
          )}
          {/* 미세 구분선 */}
          <div
            style={{
              borderTop: `1px dashed ${colors.line}`,
              margin: "1px 0",
            }}
          />

          {s.riskAndPolicyFocus.length > 0 && (
            <>
              <SubHeading style={{ marginTop: s.coreMessage ? 20 : 10 ,
                marginBottom:10
              }}>
                위험·정책 초점
              </SubHeading>
              <BulletList items={s.riskAndPolicyFocus} small />
            </>
          )}
        </HighlightBox>
      )}

      <Divider />

      {/* 2. 적용 범위 / 범위·적용대상 */}
      {s.scopeAndCoverage.length > 0 && (
        <Section title="적용 범위">
          <BulletList items={s.scopeAndCoverage} />
        </Section>
      )}
      <Divider />

      {/* 3. 최소 요구 조치 */}
      {s.minimumRequiredMeasures.length > 0 && (
        <Section title="최소 요구 조치">
          <BulletList items={s.minimumRequiredMeasures} />
        </Section>
      )}
      <Divider />

      {/* 4. 이행 메커니즘 / 감독·제재 */}
      {(s.implementationMechanisms.length > 0 ||
        s.supervisionAndEnforcement.length > 0) && (
        <Section title="이행·감독 구조">
          {s.implementationMechanisms.length > 0 && (
            <>
              <SubHeading>이행 메커니즘</SubHeading>
              <BulletList items={s.implementationMechanisms} />
            </>
          )}
          {/* 미세 구분선 */}
          <div
            style={{
              borderTop: `1px dashed ${colors.line}`,
              margin: "10px 0",
            }}
          />

          {s.supervisionAndEnforcement.length > 0 && (
            <>
              <SubHeading style={{ marginTop: 12 }}>감독·제재</SubHeading>
              <BulletList items={s.supervisionAndEnforcement} />
            </>
          )}
        </Section>
      )}
      <Divider />

      {/* 5. 국가 재량·유연성 */}
      {s.flexibilityAndNationalDiscretion.length > 0 && (
        <Section title="국가 재량과 유연성">
          <BulletList items={s.flexibilityAndNationalDiscretion} />
        </Section>
      )}
      <Divider />

      {/* 6. 반복되는 취약 지점 */}
      {s.typicalGapsOrFailureModes.length > 0 && (
        <Section title="반복되는 취약 지점">
          <BulletList items={s.typicalGapsOrFailureModes} />
        </Section>
      )}
      <Divider />

      {/* 7. 이행상 도전 과제 */}
      {s.implementationChallenges.length > 0 && (
        <Section title="이행상 도전 과제">
          <BulletList items={s.implementationChallenges} />
        </Section>
      )}
      <Divider />

      {/* 8. 연계·의존 관계 */}
      {s.crossReferenceAndDependencies.length > 0 && (
        <Section title="연계·의존 관계">
          <BulletList items={s.crossReferenceAndDependencies} />
        </Section>
      )}
      <Divider />

      {/* 9. 독자 참고 메모 */}
      {s.notesForReaders.length > 0 && (
        <Section title="독자 참고 메모">
          <BulletList items={s.notesForReaders} />
        </Section>
      )}
    </article>
      </>
  );
}

/* ======================
 * UI Components
 * ====================== */

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
      onClick={() => onOpen(pageStart + 1)} // ✅ 여기서 offset 처리 (FATF도 -1 → +1)
      style={{
        marginTop: 8,
        marginBottom: 8,
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 18,
        }}
      >
        {title}
      </h2>
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
        margin: "20px 0 24px 0",
      }}
    />
  );
}

function BulletList({
  items,
  small,
}: {
  items?: string[];
  small?: boolean;
}) {
  if (!items || items.length === 0) return null;

  return (
    <ul
      style={{
        listStyleType: "disc",
        paddingLeft: 18,
        margin: 0,
        marginBottom: 5,
        fontSize: 13.5,
        lineHeight: 1.8,
        color: "#374151",
      }}
    >
      {items.map((i, idx) => (
        <li key={idx} style={{ marginBottom: small ? 4 : 6 }}>
          {i}
        </li>
      ))}
    </ul>
  );
}

function SubHeading({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function HighlightBox({ children }: { children: React.ReactNode }) {
  // 딱 이 하나만 "카드 느낌" (약한 배경 + 보더)
  return (
    <section
      style={{
        marginBottom: 32,
        padding: 14,
        borderRadius: 10,
        border: `1px solid ${colors.line}`,
        background: "#f9fafb",
      }}
    >
      {children}
    </section>
  );
}

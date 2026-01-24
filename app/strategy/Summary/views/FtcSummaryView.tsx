// law-frontend/app/strategy/Summary/views/FtcSummaryView.tsx

"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../../StrategyUIContext";
import {
  adaptFightingTaxCrime2ndExecSummaryBlocks,
  FtcExecSummarySourceBlocksVM,
  FtcTenPrincipleImplementationChallengeJson,
  FtcTenPrincipleCaseHighlightJson,
} from "../adapters/FightingTaxCrime2ndEditionBlocks.adapter";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";

const colors = {
  ink: "#111827",
  muted: "#585b60",
  line: "#e5e7eb",
  accent: "#6d28d9",
};

export function FtcSummaryView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  const {
    selectedSummaryBlockId,
    setSelectedSummaryBlockId,
    setViewMode,
    setBriefPage,
  } = useStrategyUI();

  const [vm, setVm] = useState<FtcExecSummarySourceBlocksVM | null>(null);
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
          `http://127.0.0.1:8000/api/publications/a/${bookId}/exec-summary`
        );

        if (!res.ok) {
          throw new Error(`exec-summary 요청 실패 (status: ${res.status})`);
        }

        const json = await res.json();
        const adapted = adaptFightingTaxCrime2ndExecSummaryBlocks(json);

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
      <div
        style={{
          padding: 48,
          color: colors.muted,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        요약을 불러오는 중 오류가 발생했습니다:
        <br />
        <span style={{ fontSize: 13 }}>{error}</span>
      </div>
    );
  }

  if (!vm) {
    return (
      <div
        style={{
          padding: 48,
          color: colors.muted,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        요약을 불러오는 중…
      </div>
    );
  }

  if (!selectedSummaryBlockId) {
    return (
      <div
        style={{
          padding: 48,
          color: colors.muted,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        왼쪽에서 요약 블록을 선택하세요.
      </div>
    );
  }

  const block = vm.blocks.find((b) => b.blockId === selectedSummaryBlockId);
  if (!block) {
    return (
      <div
        style={{
          padding: 48,
          color: colors.muted,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        선택한 블록을 찾을 수 없습니다.
      </div>
    );
  }

  const t = block.tenPrinciple;

  const hasAny =
    !!t.coreMessage ||
    t.policyRationale.length > 0 ||
    t.legalRequirements.length > 0 ||
    t.operationalElements.length > 0 ||
    t.cooperationDimensions.length > 0 ||
    t.implementationChallenges.length > 0 ||
    t.caseHighlights.length > 0 ||
    t.deferredQuestions.length > 0;

  if (!hasAny) {
    return (
      <div
        style={{
          padding: 48,
          color: colors.muted,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        표시할 요약 정보가 없습니다.
      </div>
    );
  }

  const headerMeta = `p.${block.pageRange.pageStart}–${block.pageRange.pageEnd}`;

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
        lineHeight: 1.7,
        color: colors.ink,
        fontSize: 14,
        background: "#ffffff",
      }}
    >
      {/* 상단 메타 + 원문 링크 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <SourceLinkInline
          pageStart={block.pageRange.pageStart}
          pageEnd={block.pageRange.pageEnd}
          onOpen={(pageStart) => {
            setBriefPage(pageStart);
            setViewMode("BRIEFS");
          }}
        />
        <div
          style={{
            fontSize: 11,
            color: colors.muted,
          }}
        >
        </div>
      </div>

      {/* 제목 */}
      <header
        style={{
          marginBottom: 20,
          borderBottom: `1px solid ${colors.line}`,
          paddingBottom: 12,
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: 0,
            marginBottom: 4,
            letterSpacing: "-0.01em",
          }}
        >
          {block.sectionTitle}
        </h1>
        <div
          style={{
            fontSize: 13,
            color: colors.muted,
          }}
        >
        </div>
      </header>

      {/* 1. 이 원칙의 취지 / 정책 논리 */}
      {(t.coreMessage || t.policyRationale.length > 0) && (
        <Section title="이 원칙의 취지">
          {t.coreMessage && (
            <p
              style={{
                margin: 0,
                marginBottom: t.policyRationale.length ? 10 : 0,
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.8,
              }}
            >
              {t.coreMessage}
            </p>
          )}

          {t.policyRationale.length > 0 && (
            <div style={{ marginTop: t.coreMessage ? 8 : 0 }}>
              <SubHeading>정책적 근거</SubHeading>
              <CollapsibleBulletList items={t.policyRationale} previewCount={3} small />
            </div>
          )}
        </Section>
      )}
      <Divider />

      {/* 2. 법적 요건 */}
      {t.legalRequirements.length > 0 && (
        <Section title="법적 요건">
          {t.legalRequirements.map((lr, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <BlockLabel>{lr.label}</BlockLabel>
              {lr.description && (
                <p
                  style={{
                    margin: 0,
                    marginBottom: lr.typical_legal_forms.length ? 6 : 0,
                  }}
                >
                  {lr.description}
                </p>
              )}

              {lr.typical_legal_forms.length > 0 && (
                <SubListLabel>주요 법적 형태</SubListLabel>
              )}
              {lr.typical_legal_forms.length > 0 && (
                <BulletList items={lr.typical_legal_forms} />
              )}

            {/* ✅ 마지막 항목이 아닐 때만 점선 */}
            { idx < t.legalRequirements.length - 1 && (
              <div
                style={{
                  borderTop: `1px dashed ${colors.line}`,
                  margin: "10px 0",
                }}
              />
            )}
            </div>
          ))}
        </Section>
      )}
      <Divider />

      {/* 3. 운영 요소 */}
      {t.operationalElements.length > 0 && (
        <Section title="운영 요소">
          {t.operationalElements.map((op, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <BlockLabel>{op.label}</BlockLabel>
              {op.description && (
                <p
                  style={{
                    margin: 0,
                    marginBottom: op.typical_mechanisms.length ? 12 : 0,
                  }}
                >
                  {op.description}
                </p>
              )}
              {op.typical_mechanisms.length > 0 && (
                <SubListLabel>주요 운용 방식</SubListLabel>
              )}
              {op.typical_mechanisms.length > 0 && (
                <BulletList items={op.typical_mechanisms} />
              )}
              {/* ✅ 마지막 항목이 아닐 때만 점선 */}
            { idx < t.operationalElements.length - 1 && (
              <div
                style={{
                  borderTop: `1px dashed ${colors.line}`,
                  margin: "10px 0",
                }}
              />
            )}
            </div>
          ))}
        </Section>
      )}
      <Divider />

      {/* 4. 연계·공조 구조 */}
      {t.cooperationDimensions.length > 0 && (
        <Section title="연계·공조 구조">
          {t.cooperationDimensions.map((co, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <BlockLabel>{co.label}</BlockLabel>
              {co.description && (
                <p
                  style={{
                    margin: 0,
                    marginBottom: co.main_counterparties.length ? 6 : 0,
                  }}
                >
                  {co.description}
                </p>
              )}
              {co.main_counterparties.length > 0 && (
                <SubListLabel>주요 협력 상대</SubListLabel>
              )}
              {co.main_counterparties.length > 0 && (
                <BulletList items={co.main_counterparties} />
              )}
            </div>
          ))}
        </Section>
      )}
      <Divider />

      {/* 5. 이행상 어려움 */}
      {t.implementationChallenges.length > 0 && (
        <Section title="이행상 어려움">
          {t.implementationChallenges.map((ch, idx) => (
            <ChallengeBlock key={idx} ch={ch} />
          ))}
        </Section>
      )}
      <Divider />

      {/* 6. 사례 요약 */}
      {t.caseHighlights.length > 0 && (
        <Section title="사례 요약">
          {t.caseHighlights.map((c, idx) => (
            <CaseHighlightBlock key={idx} ch={c} />
          ))}
        </Section>
      )}
      <Divider />

      {/* 7. 남은 쟁점 */}
      {t.deferredQuestions.length > 0 && (
        <Section title="추후 논의">
          <BulletList items={t.deferredQuestions} />
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
      onClick={() => onOpen(pageStart +2)} // offset -1 → +1
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
    <section
      style={{
        marginTop: 28,
        paddingTop: 4,
      }}
    >
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 15,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
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
        marginBottom: 24,
        fontSize: 13,
        lineHeight: 1.65,
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
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 4,
        color: colors.muted,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 12,
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

function SubListLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: colors.muted,
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

function ChallengeBlock({
  ch,
}: {
  ch: FtcTenPrincipleImplementationChallengeJson;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {ch.pattern}
      </div>

      {ch.why_it_matters && (
        <div
          style={{
            fontSize: 13,
            color: colors.muted,
            marginBottom: ch.book_suggested_responses.length ? 6 : 0,
          }}
        >
          {ch.why_it_matters}
        </div>
      )}

      {ch.book_suggested_responses.length > 0 && (
        <BulletList items={ch.book_suggested_responses} small />
      )}
    </div>
  );
}

function CaseHighlightBlock({
  ch,
}: {
  ch: FtcTenPrincipleCaseHighlightJson;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 2,
        }}
      >
        {ch.case_id}
      </div>
      {ch.jurisdiction_or_context && (
        <div
          style={{
            fontSize: 12,
            color: colors.muted,
            marginBottom: 4,
          }}
        >
          {ch.jurisdiction_or_context}
        </div>
      )}
      {ch.what_it_shows && (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          {ch.what_it_shows}
        </p>
      )}
    </div>
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

function CollapsibleBulletList({
  items,
  previewCount = 3,
  small,
}: {
  items?: string[];
  previewCount?: number;
  small?: boolean;
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
      <BulletList items={visibleItems} small={small} />

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

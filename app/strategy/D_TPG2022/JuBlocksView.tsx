// law-frontend/app/strategy/JU/views/JuBlocksView.tsx

"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../StrategyUIContext";
import {
  adaptJudgementUnitsFromApi,
  JudgementUnitsVM,
  JudgementUnitVM,
  JuMandatoryConceptJson,
  JuDecisionFlowStepJson,
  JuNavigationJson,
  JuNavigationLinkJson,
  JuBoundariesJson,
} from "./adapters/JudgementUnits.adapter";
import { PAGE_OFFSET_BY_BOOK } from "../pageoffset";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getStrategyAccess } from "../access";
import { useRouter } from "next/navigation";


const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  deep: "#4c5159ff",
  text:"#111827",
};

interface JuBlocksViewProps {
  bookId: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export function JuBlocksView({ bookId }: JuBlocksViewProps) {
  const { userId } = useAuth();
  const {
    selectedJudgeId,
    setSelectedJudgeId,
    setViewMode,
    setBriefPage,
  } = useStrategyUI();
  const router = useRouter();
  const userAccess = useUserAccessLevel();
  const access = getStrategyAccess(userAccess, "MJU");
  const isLocked = access !== "FULL";

  const [vm, setVm] = useState<JudgementUnitsVM | null>(null);
  const [error, setError] = useState<string | null>(null);
  const offset = PAGE_OFFSET_BY_BOOK[bookId] ?? 0;
  const saveThought = useSaveThought();
  const [showHint, setShowHint] = useState(false);

useRecordStrategyTrace({
  userId,
  parentType: "strategy",
  parentId: bookId,
  traceType: "reasoning",
  traceId: selectedJudgeId,
});

  const [saving, setSaving] = useState(false);
  // 저장 버튼 클릭 핸들러
  const handleSavejudge = async () => {
    if (!userId || !selectedJudgeId || saving) return; // selectedRiskTypologyId가 null이면 처리하지 않음

    setSaving(true); // saving 상태 시작
    try {
      await saveThought({
        parentType: "strategy",
        parentId: bookId,
        targetType: "reasoning",  // 예: "reasoning"은 상황에 맞게 수정
        targetId: selectedJudgeId, // selectedRiskTypologyId는 이제 null이 아님
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
          `${API_BASE}/api/publications/d/${bookId}/mju_blocks`
        );


        if (!res.ok) {
          throw new Error(
            `judgement_units 요청 실패 (status: ${res.status})`
          );
        }

        const raw = await res.json();
        const adapted = adaptJudgementUnitsFromApi(raw);

        if (cancelled) return;

        setVm(adapted);

        // 아직 선택된 블록이 없으면 첫 블록 자동 선택
        if (
          !selectedJudgeId &&
          adapted.blocks &&
          adapted.blocks.length > 0
        ) {
          setSelectedJudgeId(adapted.blocks[0].blockId);
        }
      } catch (e: any) {
        if (cancelled) return;
        console.error(e);
        setError(
          e instanceof Error
            ? e.message
            : "judgement_units 데이터를 불러오는 중 오류가 발생했습니다."
        );
        setVm(null);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [bookId, selectedJudgeId, setSelectedJudgeId]);

  if (error) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        JU 블록을 불러오는 중 오류가 발생했습니다:
        <br />
        <span style={{ fontSize: 13 }}>{error}</span>
      </div>
    );
  }

  if (!vm) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        JU 블록을 불러오는 중…
      </div>
    );
  }

  if (!selectedJudgeId) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        왼쪽에서 판단 블록을 선택하세요.
      </div>
    );
  }

  const block: JudgementUnitVM | undefined = vm.blocks.find(
    (b) => b.blockId === selectedJudgeId
  );

  if (!block) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
        선택한 블록을 찾을 수 없습니다.
      </div>
    );
  }

  const pageRange = block.pageRange;

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
            onClick={handleSavejudge}
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
      {/* 원문 참고 (brief로 점프) */}
      {pageRange.pageStart !== null && pageRange.pageEnd !== null && (
        <SourceLinkInline
          pageStart={pageRange.pageStart}
          pageEnd={pageRange.pageEnd}
          onOpen={(pageStart) => {
            setBriefPage(pageStart+2);
            setViewMode("BRIEFS");
          }}
        />
      )}

      {/* 타이틀 + 메타 */}
    <h1
      style={{
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: 6,
          background: "#f3f4f6",
          color: colors.deep,
        }}
      >
        {block.blockId}
      </span>

      <span>
        {block.title || "(제목 없음)"}
      </span>
    </h1>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          fontSize: 12,
          color: colors.muted,
          marginBottom: 12,
        }}
      >
      </div>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* 핵심 질문 */}
      <Section title="핵심 판단 질문">
        <div style={{ position: "relative", minHeight: 120 }}>
          <div style={blurStyle(isLocked)}>
            {block.core_question ? (
              <p style={{ fontSize: 14 }}>{block.core_question}</p>
            ) : (
              <EmptyText />
            )}
          </div>

          {isLocked && (
            <div style={lockOverlayStyle}>
              <p style={{ fontSize: 14, fontWeight: 600, textAlign: "center" }}>
                이 전략 설계도는
                <br />
                <strong>구독 후 전체 확인할 수 있습니다</strong>
              </p>
              <button
                style={ctaButtonStyle}
                onClick={() => router.push("/me/subscribe?from=strategy")}
              >
                구독하고 전체 보기
              </button>
            </div>
          )}
        </div>
      </Section>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* 이 블록이 필요한 이유 */}
      <Section title="이 판단 기준이 필요한 이유">
        <div style={{ position: "relative", minHeight: 80 }}>
          <div style={blurStyle(isLocked)}>
            {block.why_this_exists ? (
              <p style={{ fontSize: 14 }}>{block.why_this_exists}</p>
            ) : (
              <EmptyText />
            )}
          </div>
        </div>
      </Section>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* 필수 개념 */}
      <Section title="필수 개념 (Mandatory concepts)">
        <div style={{ position: "relative", minHeight: 120 }}>
          <div style={blurStyle(isLocked)}>
            {block.mandatory_concepts.length > 0 ? (
              block.mandatory_concepts.map(
                (mc: JuMandatoryConceptJson, idx: number) => (
                  <MandatoryConceptCard key={idx} mc={mc} />
                )
              )
            ) : (
              <EmptyText />
            )}
          </div>
        </div>
      </Section>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />


      {/* 판단 절차 (Decision flow) */}
      <Section title="판단 절차 (Decision flow)">
        <div style={{ position: "relative", minHeight: 140 }}>
          <div style={blurStyle(isLocked)}>
            {block.decision_flow.length > 0 ? (
              block.decision_flow.map(
                (step: JuDecisionFlowStepJson, idx: number) => (
                  <DecisionFlowCard key={idx} step={step} />
                )
              )
            ) : (
              <EmptyText />
            )}
          </div>
        </div>
      </Section>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />


      {/* 관련 원문 / 네비게이션 */}
      <Section title="관련 원문 및 참고 (Navigation)">
        <div style={{ position: "relative", minHeight: 100 }}>
          <div style={blurStyle(isLocked)}>
            {block.navigation ? (
              <NavigationSection
                navigation={block.navigation}
                onOpenPage={(pageStart) => {
                  setBriefPage(pageStart + 2);
                  setViewMode("BRIEFS");
                }}
              />
            ) : (
              <EmptyText />
            )}
          </div>
        </div>
      </Section>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />


      {/* 한계와 주의점 */}
      <Section title="한계와 주의점 (Boundaries)">
        <div style={{ position: "relative", minHeight: 80 }}>
          <div style={blurStyle(isLocked)}>
            {block.boundaries ? (
              <BoundariesSection boundaries={block.boundaries} />
            ) : (
              <EmptyText />
            )}
          </div>
        </div>
      </Section>

    </article>
        </>
  );
}

/* ============================== */
/* 공통 UI 컴포넌트               */
/* ============================== */

const blurStyle = (locked: boolean): React.CSSProperties => ({
  filter: locked ? "blur(6px)" : "none",
  pointerEvents: locked ? "none" : "auto",
  userSelect: locked ? "none" : "auto",
});
const lockOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(2px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  zIndex: 10,
};

const ctaButtonStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  fontSize: 13,
  cursor: "pointer",
};

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

function EmptyText() {
  return (
    <div style={{ fontSize: 14, color: colors.muted }}>
      내용이 제공되지 않았습니다.
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return <EmptyText />;
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

/* ============================== */
/* JU 전용 카드 컴포넌트          */
/* ============================== */

function MandatoryConceptCard({ mc }: { mc: JuMandatoryConceptJson }) {
  return (
    <div
      style={{
        border: `1px solid ${colors.line}`,
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        background: "#ffffff",
      }}
    >
      {/* Term */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 8,
          color: colors.deep,
        }}
      >
        {mc.term}
      </div>

      {/* Definition */}
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          marginBottom:
            mc.why_it_matters || mc.common_misunderstanding ? 14 : 0,
          color: colors.text,
        }}
      >
        {mc.definition}
      </div>

      {/* Why it matters */}
      {mc.why_it_matters && (
        <div style={{ marginBottom: mc.common_misunderstanding ? 10 : 0 }}>
          {/* label only */}
          <div
            style={{
              borderLeft: "3px solid #2f855a",
              paddingLeft: 8,
              fontWeight: 700,
              fontSize: 13,
              color: "#2f855a",
              marginBottom: 8,
            }}
          >
            왜 중요한가
          </div>

          {/* description (no border) */}
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              marginBottom: 15,
              paddingLeft: 10,

              color: colors.text,
            }}
          >
            {mc.why_it_matters}
          </div>
        </div>
      )}

      {/* Common misunderstanding */}
      {mc.common_misunderstanding && (
        <div>
          {/* label only */}
          <div
            style={{
              borderLeft: "3px solid #b7791f",
              paddingLeft: 8,
              fontWeight: 700,
              fontSize: 13,
              color: "#b7791f",
              marginBottom: 8,
            }}
          >
            흔한 오해
          </div>

          {/* description (no border) */}
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              paddingLeft: 10,
              color: colors.text,
            }}
          >
            {mc.common_misunderstanding}
          </div>
        </div>
      )}
    </div>
  );
}



function DecisionFlowCard({ step }: { step: JuDecisionFlowStepJson }) {
  return (
    <div
      style={{
        border: `1px solid ${colors.line}`,
        borderRadius: 10,
        padding: 16,
        marginBottom: 14,
        background: "#ffffff",
      }}
    >
      {/* Step + Question (single line) */}
      {step.question && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            fontSize: 14,
            lineHeight: 1.5,
            marginBottom: 12,
            color: colors.deep,
          }}
        >
          {typeof step.step === "number" && (
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: colors.ink,
                flexShrink: 0,
              }}
            >
              {step.step}.
            </span>
          )}
          <span style={{ fontWeight: 600,
            color: colors.text,
           }}>
            {step.question}
          </span>
        </div>
      )}
      {/* YES / NO */}
      {(step.yes_leads_to || step.no_leads_to) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            fontSize: 13,
          }}
        >
          {step.yes_leads_to && (
            <DecisionBranch
              label="YES"
              color="#2f855a"
              text={step.yes_leads_to}
            />
          )}
          {step.no_leads_to && (
            <DecisionBranch
              label="NO"
              color="#c53030"
              text={step.no_leads_to}
            />
          )}
        </div>
      )}
    </div>
  );
}

function DecisionBranch({
  label,
  color,
  text,
}: {
  label: "YES" | "NO";
  color: string;
  text: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${color}`,
        borderRadius: 8,
        padding: 10,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 12,
          color,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div>{text}</div>
    </div>
  );
}

// ✅ JuBlocksView.tsx 에서 "number | undefined" 문제 100% 제거 버전
// - item.page_start/page_end 가 optional일 수 있으니, 버튼 렌더 전에 "타입가드"로 확정
// - onOpenPage는 number만 받음

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function NavigationSection({
  navigation,
  onOpenPage,
}: {
  navigation: JuNavigationJson;
  onOpenPage: (pageStart: number) => void;
}) {
  const entries: { group: string; item: JuNavigationLinkJson }[] = [];

  Object.entries(navigation).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        entries.push({
          group: key,
          item: v as JuNavigationLinkJson,
        });
      });
    }
  });

  if (entries.length === 0) {
    return <EmptyText />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontSize: 14,
      }}
    >
      {entries.map(({ group, item }, idx) => {
        const hasPages =
          isFiniteNumber(item.page_start) && isFiniteNumber(item.page_end);

        return (
          <div
            key={`${group}-${idx}`}
            style={{
              border: `1px solid ${colors.line}`,
              borderRadius: 6,
              padding: 10,
              background: "#fafafa",
            }}
          >
            {/* 그룹 */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                color: colors.muted,
                marginBottom: 4,
              }}
            >
              {group}
            </div>

            {/* 메인 라인 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {item.chapter && <span>Ch. {item.chapter}</span>}
              {item.section && <span>Sec. {item.section}</span>}
              {item.title && (
                <span style={{ fontWeight: 600 }}>{item.title}</span>
              )}

            {hasPages && (() => {
              const pageStart = item.page_start;
              const pageEnd = item.page_end;

              if (typeof pageStart !== "number" || typeof pageEnd !== "number") {
                return null;
              }

              return (
                <button
                  onClick={() => onOpenPage(pageStart)}
                  style={{
                    fontSize: 12,
                    color: "#6d28d9",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  (p.{pageStart}–{pageEnd})
                </button>
              );
            })()}

            </div>

            {/* 이유 */}
            {item.reason && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: colors.ink,
                }}
              >
                {item.reason}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BoundariesSection({ boundaries }: { boundaries: JuBoundariesJson }) {
  const hasDepends =
    Array.isArray(boundaries.depends_on) &&
    boundaries.depends_on.length > 0;

  const DEPENDS_ON_LABEL_MAP: Record<string, string> = {
  facts: "사실관계",
  local_law: "국내법",
  case_law: "판례해석",
};


  return (
    <div style={{ fontSize: 14, lineHeight: 1.7 }}>
      {boundaries.not_a_rule && (
        <p style={{ marginBottom: 10 }}>{boundaries.not_a_rule}</p>
      )}

      {hasDepends && (
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            다음 요소에 따라 달라집니다:
          </div>
          <BulletList
            items={(boundaries.depends_on as string[]).map(
              (key) => DEPENDS_ON_LABEL_MAP[key] ?? key
            )}
          />        
          </div>
      )}

      {boundaries.tp_risk_note && (
        <p
          style={{
            borderTop: `1px dashed ${colors.line}`,
            paddingTop: 10,
            marginTop: 4,
            fontSize: 13,
            color: colors.deep,
          }}
        >
          {boundaries.tp_risk_note}
        </p>
      )}

      {!boundaries.not_a_rule && !hasDepends && !boundaries.tp_risk_note && (
        <EmptyText />
      )}
    </div>
  );
}


// law-frontend/app/strategy/Summary/views/NatSummaryView.tsx

"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../../StrategyUIContext";
import {
  adaptNatExecSummaryBlocks,
  NatExecSummarySourceBlocksVM,
} from "../adapters/NationalStrategyTaxCrimeBlocks.adapter";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  accent: "#6d28d9",
  cardBg: "#f9fafb",
};

export function NatSummaryView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  
  
  const {
    selectedSummaryBlockId,
    setSelectedSummaryBlockId,
    setViewMode,
    setBriefPage,
  } = useStrategyUI();

  const [vm, setVm] = useState<NatExecSummarySourceBlocksVM | null>(
    null
  );
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
      const adapted = adaptNatExecSummaryBlocks(json);

      setVm(adapted);

      // 아무 것도 선택 안 되어 있으면 첫 블록 기본 선택
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
        {/* 상단 메타 + 원문 링크 */}
        <div
        >
        <div
            style={{
            fontSize: 12,
            color: colors.muted,
            }}
        >
            {/* 필요하면 메타 텍스트 */}
        </div>

        <SourceLinkInline
            pageStart={block.pageRange.pageStart}
            pageEnd={block.pageRange.pageEnd}
            onOpen={(pageStart) => {
            setBriefPage(pageStart);
            setViewMode("BRIEFS");
            }}
        />
        </div>


      {/* Section title */}
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {block.sectionTitle}
      </h1>

      <div
        style={{
          fontSize: 12,
          color: colors.muted,
          marginBottom: 20,
        }}
      >
        National strategy against tax crime · executive summary
      </div>

      <hr style={{ borderColor: colors.line, marginBottom: 24 }} />

      {/* ===== National Strategy Cognitive State ===== */}
      {block.nationalStrategy && (
        <>
          <Section title="국가 전략 인식 구조">
            <p
              style={{
                fontSize: 14,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: colors.muted,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginRight: 4,
                }}
              >
                전략적 기능
              </span>
              <span>{block.nationalStrategy.strategicFunction}</span>
            </p>
            <p
              style={{
                fontSize: 14,
                marginBottom: 0,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: colors.muted,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginRight: 4,
                }}
              >
                이해 상태
              </span>
              <span>{block.nationalStrategy.stateOfUnderstanding}</span>
            </p>
          </Section>

          {block.nationalStrategy.analyticalAssets.length > 0 && (
            <Section title="분석 자산(Analytical assets)">
              {block.nationalStrategy.analyticalAssets.map((a, i) => (
                <Card key={i} title={a.label}>
                  <p
                    style={{
                      fontSize: 14,
                      marginBottom: a.typical_uses.length ? 12 : 0,
                      borderBottom: `1px dashed ${colors.line}`,
                      paddingBottom: 6,
                    }}
                  >
                    {a.description}
                  </p>
                  {a.typical_uses.length > 0 && (
                    <>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: colors.muted,
                          marginBottom: 6,

                        }}
                      >
                        전형적 활용:
                      </div>
                      <BulletList items={a.typical_uses} />
                    </>
                  )}
                </Card>
              ))}
            </Section>
          )}

          {block.nationalStrategy.constrainedThinking.length > 0 && (
            <Section title="제한된 사고의 오류와 교정">
              {block.nationalStrategy.constrainedThinking.map((c, i) => (
            <Card key={i}>
              {/* 기존 인식 */}
              <div
                style={{

                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 2,
                    color: "#363a3f",
                    borderLeft: "3px solid #cbcdd1",
                    paddingLeft: 10,
                  }}
                >
                  기존 인식
                  <span style={{ color: "#9ca3af", fontWeight: 400, 
                   }}>
                    {" "} / previous
                  </span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.7, 
                  paddingLeft: 12, color: "#111827" }}>
                  {c.previous_pattern}
                </div>
              </div>

              {/* 한계점 */}
              <div
                style={{
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 2,
                    paddingLeft: 10,
                  borderLeft: "3px solid #f59e0b", // 주황

                    color: "#b45309",
                  }}
                >
                  한계점
                  <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                    {" "} / why limited
                  </span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.7,
                  paddingLeft: 12, color: "#111827" }}>
                  {c.why_limited}
                </div>
              </div>

              {/* 개선된 기준 */}
              <div
                style={{

                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 2,
                    borderLeft: "3px solid #16a34a", // 초록
                    paddingLeft: 10,
                    color: "#166534",
                  }}
                >
                  개선된 기준
                  <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                    {" "} / updated criterion
                  </span>
                </div>
                <div style={{ fontSize: 14, paddingLeft: 12,lineHeight: 1.7, color: "#111827" }}>
                  {c.updated_criterion}
                </div>
              </div>
            </Card>
              ))}
            </Section>
          )}

          {block.nationalStrategy.legitimateVariations.length > 0 && (
            <Section title="정책 설계상의 정당한 다양성">
              {block.nationalStrategy.legitimateVariations.map((v, i) => (
                <Card key={i}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {v.dimension}
                  </p>
                  <p style={{ marginBottom: 0 }}>{v.justification}</p>
                </Card>
              ))}
            </Section>
          )}

          {block.nationalStrategy.deferredPolicyQuestions.length > 0 && (
            <Section title="추후 검토할 정책 쟁점">
              {block.nationalStrategy.deferredPolicyQuestions.map(
                (q, i) => (
                <Card key={i}>
                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.muted,
                        marginBottom: 2,
                        
                      }}
                    >
                      검토 대상
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: colors.ink,
                                borderBottom: `1px dashed ${colors.line}`,
                                paddingBottom: 6,

                     }}>
                      {q.question}
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.muted,
                        marginBottom: 2,
                      }}
                    >
                      유보 사유
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, 
                                borderBottom: `1px dashed ${colors.line}`,
                                  paddingBottom: 6,
                        color: colors.ink }}>
                      {q.reason_for_deferral}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.muted,
                        marginBottom: 2,
                      }}
                    >
                      추후 검토 단계
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: colors.ink }}>
                      {q.expected_later_stage}
                    </div>
                  </div>
                </Card>

                )
              )}
            </Section>
          )}
        </>
      )}

      {/* ===== Case-based Learning ===== */}
      {block.caseBasedLearning && (
        <>

          <Section title="국가별 사례 분석 (Case-based learning)">
            <Card>
              <p style={{ marginBottom: 12 }}>
                <strong>운용 제도:</strong>{" "}
                {
                  block.caseBasedLearning.jurisdictionContext
                    .institutional_model
                }
              </p>

              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: colors.muted,
                  marginBottom: 4,
                }}
              >
                주요 조세범죄·도전 과제
              </p>
              <BulletList
                items={
                  block.caseBasedLearning.jurisdictionContext
                    .tax_crime_challenges
                }
              />

              <p style={{ marginTop: 12, marginBottom: 0 }}>
                <strong>독자에게 중요한 이유:</strong>{" "}
                {
                  block.caseBasedLearning.jurisdictionContext
                    .why_relevant_to_readers
                }
              </p>
            </Card>
          </Section>

          {block.caseBasedLearning.strategyComponentsInPractice.length >
            0 && (
            <Section title="실제 적용된 전략 구성요소">
              {block.caseBasedLearning.strategyComponentsInPractice.map(
                (s, i) => (
                  <Card key={i} title={s.component_label}>
                    <p style={{ marginBottom: 6 }}>{s.description}</p>
                    <p style={{ marginBottom: 0 }}>
                      <strong>역할 기능:</strong>{" "}
                      {s.purpose_in_case}
                    </p>
                  </Card>
                )
              )}
            </Section>
          )}

          {block.caseBasedLearning.implementationPatterns.length > 0 && (
            <Section title="운용 방식(Implementation patterns)">
              {block.caseBasedLearning.implementationPatterns.map(
                (p, i) => (
                  <Card key={i} title={p.pattern_label}>
                    <p style={{ marginBottom: 12 }}>
                      <strong>작동 방식:</strong> {p.mechanism}
                    </p>
                    {p.enabling_factors.length > 0 && (
                      <>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: colors.muted,
                            marginBottom: 4,
                          }}
                        >
                          전제 조건(Enabling factors)
                        </div>
                        <BulletList items={p.enabling_factors} />
                      </>
                    )}
                    <p style={{ marginTop: 12, marginBottom: 0 }}>
                      <strong>주의 사항:</strong>{" "}
                      {p.risks_if_copied_blindly}
                    </p>
                  </Card>
                )
              )}
            </Section>
          )}

          {block.caseBasedLearning.transferableInsights.length > 0 && (
            <Section title="정책 시사점">
              {block.caseBasedLearning.transferableInsights.map(
                (t, i) => (
                  <Card key={i}>
                    <p style={{ marginBottom: 12, fontWeight: 600,  }}>{t.insight}</p>
                    <p style={{ marginBottom: 8 }}>
                      <strong>적용 가능 사유:</strong>{" "}
                      {t.why_generalizable}
                    </p>
                    {t.adaptation_questions.length > 0 && (
                      <>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: colors.muted,
                            marginBottom: 4,
                          }}
                        >
                          제도 설계를 위한 점검 질문
                        </div>
                        <BulletList items={t.adaptation_questions} />
                      </>
                    )}
                  </Card>
                )
              )}
            </Section>
          )}

          {block.caseBasedLearning.caseSpecificLimits.length > 0 && (
            <Section title="사례 적용상의 제약 조건">
              {block.caseBasedLearning.caseSpecificLimits.map(
                (l, i) => (
                  <Card key={i}>
                    <p style={{ marginBottom: 6, fontWeight: 600}}>
                      {l.limit_description}
                    </p>
                    <p style={{ marginBottom: 6 }}>
                      <strong>국가별 요인:</strong>{" "}
                      {l.country_specific_factors}
                    </p>
                    <p style={{ marginBottom: 0 }}>
                      <strong>타 관할에 대한 함의:</strong>{" "}
                      {l.implication_for_reader}
                    </p>
                  </Card>
                )
              )}
            </Section>
          )}
        </>
      )}
    </article>
        </>
  );
}

/* ---------- UI Helpers ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
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
    <div
      style={{
        border: `1px solid ${colors.line}`,
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        background: colors.cardBg,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          {title}
        </div>
      )}

      {children}
      </div>
  );
}

function BulletList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <ul
      style={{
        listStyleType: "disc",
        paddingLeft: 18,
        margin: "4px 0 0 0",
        fontSize: 14,
        lineHeight: 1.6,

      }}
    >
      {items.map((i, idx) => (
        <li key={idx} style={{ marginBottom: 4 , fontSize: 13, }}>
          {i}
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

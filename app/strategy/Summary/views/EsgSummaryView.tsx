// law-frontend/app/strategy/Summary/views/EsgSummaryView.tsx

"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../../StrategyUIContext";
import {
  adaptEndShellGameExecSummaryBlocks,
  EsgExecSummarySourceBlocksVM,
  EsgImplementationChallengeJson,
} from "../adapters/EndShellGameBlocks.adapter";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getStrategyAccess } from "../../access";
import { useRouter } from "next/navigation";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  accent: "#6d28d9",
  deep: "#4c5159ff",
  text:"#111827",
};


export function EsgSummaryView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  const saveThought = useSaveThought();
  const [showHint, setShowHint] = useState(false);
  const router = useRouter();
  const userAccess = useUserAccessLevel();
  const access = getStrategyAccess(userAccess, "SUMMARY");
  const isLocked = access !== "FULL";

  const {
    selectedSummaryBlockId,
    setSelectedSummaryBlockId,
    setViewMode,
    setBriefPage,
  } = useStrategyUI();

  const [vm, setVm] = useState<EsgExecSummarySourceBlocksVM | null>(null);
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
        const adapted = adaptEndShellGameExecSummaryBlocks(json);

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

  const s = block.oecdReportCognitiveState;

  const hasAny =
    !!s.coreMessage ||
    s.keyFindings.length > 0 ||
    s.mechanisms.length > 0 ||
    s.riskFactors.length > 0 ||
    s.requirements.length > 0 ||
    s.operationalElements.length > 0 ||
    s.cooperationDimensions.length > 0 ||
    s.implementationMeasures.length > 0 ||
    s.recommendedActions.length > 0 ||
    s.implementationChallenges.length > 0 ||
    s.deferredQuestions.length > 0 ||
    s.evidenceAnchors.length > 0;

  if (!hasAny) {
    return (
      <div style={{ padding: 48, color: colors.muted }}>
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
        paddingTop: 18,
        paddingBottom: 40,
        lineHeight: 1.7,
        color: colors.ink,
        fontSize: 14,
      }}
    >
      {/* 원문 링크 – offset -1 반영(+1) */}
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

      {/* 1. 핵심 요약 (카드 X, 그냥 본문 스타일) */}
      <Section title="전문적 조력자에 대한 이해와 대응">
      <div style={{ position: "relative" }}>
      <div style={blurStyle(isLocked)}>
        {s.coreMessage && (
          <p
            style={{
              margin: 0,
              marginBottom:
                s.keyFindings.length || s.mechanisms.length || s.riskFactors.length
                  ? 12
                  : 0,
              fontSize: 15,
              fontWeight: 500,
              lineHeight: 1.8,
            }}
          >
            {s.coreMessage}
          </p>
        )}
        </div>
        </div>
        {/* 🔒 오버레이 (첫 섹션만) */}
          {isLocked && (
            <div style={lockOverlayStyle}>
              <p style={{ fontSize: 14, fontWeight: 600, textAlign: "center" }}>
                이 요약 분석은
                <br />
                <strong>유료 멤버쉽 가입 후 전체 확인할 수 있습니다</strong>
              </p>
              <button
                style={ctaButtonStyle}
                onClick={() => router.push("/me/subscribe?from=strategy")}
              >
                유료 멤버쉽 가입하기
              </button>
            </div>
          )}
      <Divider />

        {s.keyFindings.length > 0 && (
          <SubHeading>주요 발견</SubHeading>
        )}
        <div style={blurStyle(isLocked)}>
        {s.keyFindings.length > 0 && (
      <CollapsibleBulletList items={s.keyFindings} previewCount={3} small />
        )}
        </div>
      <Divider />

        {s.mechanisms.length > 0 && (
        <>
        <SubHeading style={{ marginTop: 10 }}>작동 메커니즘</SubHeading>
        <div style={blurStyle(isLocked)}>
        <CollapsibleBulletList items={s.mechanisms} previewCount={3} small />
        </div>
        </>
        )}

      <Divider />

        {s.riskFactors.length > 0 && (
        <>
        <SubHeading style={{ marginTop: 10 }}>리스크 요인</SubHeading>
        <div style={blurStyle(isLocked)}>
        <CollapsibleBulletList items={s.riskFactors} previewCount={3} small />
        </div>
        </>
        )}
      </Section>

      <Divider />

      {/* 2. 요구 사항 / 운영 요소 / 협력 축 */}
      {s.requirements.length > 0 && (
        <Section title="요구 사항">
          <div style={blurStyle(isLocked)}>
          {s.requirements.map((r, i) => (
            <BlockGroup key={i}>
              <BlockLabel>{r.label}</BlockLabel>
              {r.description && (
                <p
                  style={{
                    margin: 0,
                    marginBottom: r.sub_points.length ? 10 : 0,
                    marginTop: 10
                  }}
                >
                  {r.description}
                </p>
              )}
              {r.sub_points.length > 0 && (
                <BulletList items={r.sub_points} small />
              )}
            {/* ✅ 마지막 항목이 아닐 때만 점선 */}
            {i < s.requirements.length - 1 && (
              <div
                style={{
                  borderTop: `1px dashed ${colors.line}`,
                  margin: "10px 0",
                }}
              />
            )}
            </BlockGroup>
          ))}
          </div>
        </Section>
      )}

      <Divider />

      {s.operationalElements.length > 0 && (
        <Section title="운영 요소">
          <div style={blurStyle(isLocked)}>
          {s.operationalElements.map((o, i) => (
            <BlockGroup key={i}>
              <BlockLabel>{o.label}</BlockLabel>
              {o.description && (
                <p
                  style={{
                    margin: 0,
                    marginBottom: o.sub_points.length ? 6 : 0,
                  }}
                >
                  {o.description}
                </p>
              )}
              {o.sub_points.length > 0 && (
                <BulletList items={o.sub_points} small />
              )}
            {/* ✅ 마지막 항목이 아닐 때만 점선 */}
            {i < s.operationalElements.length - 1 && (
              <div
                style={{
                  borderTop: `1px dashed ${colors.line}`,
                  margin: "10px 0",
                }}
              />
            )}

            </BlockGroup>
          ))}
          </div>
        </Section>
      )}

      <Divider />

      {s.cooperationDimensions.length > 0 && (
        <Section title="정보 연계 및 공조 체계">
           <div style={blurStyle(isLocked)}>
          {s.cooperationDimensions.map((c, i) => (
            <BlockGroup key={i}>
              <BlockLabel>{c.label}</BlockLabel>
              {c.description && (
                <p
                  style={{
                    margin: 0,
                    marginBottom: c.sub_points.length ? 6 : 0,
                  }}
                >
                  {c.description}
                </p>
              )}
              {c.sub_points.length > 0 && (
                <BulletList items={c.sub_points} small />
              )}

            {/* ✅ 마지막 항목이 아닐 때만 점선 */}
            {i < s.cooperationDimensions.length - 1 && (
              <div
                style={{
                  borderTop: `1px dashed ${colors.line}`,
                  margin: "10px 0",
                }}
              />
            )}

            </BlockGroup>
          ))}
          </div>
        </Section>
      )}

      <Divider />

      {/* 3. 이행 / 권고 */}
      {(s.implementationMeasures.length > 0 ||
        s.recommendedActions.length > 0) && (
        <Section title="이행 · 권고">
          <div style={blurStyle(isLocked)}>
          {s.implementationMeasures.length > 0 && (
            <>
              <SubHeading>이행 수단</SubHeading>
              <BulletList items={s.implementationMeasures} />
            </>
          )}
              {/* 미세 구분선 */}
              <div
                style={{
                  borderTop: `1px dashed ${colors.line}`,
                  margin: "10px 0",
                }}
              />

          {s.recommendedActions.length > 0 && (
            <>
              <SubHeading style={{ marginTop: 12 }}>권고 조치</SubHeading>
              <BulletList items={s.recommendedActions} />
            </>
          )}
          </div>
        </Section>
      )}

      <Divider />

      {/* 4. 이행상 도전 과제 */}
      {s.implementationChallenges.length > 0 && (
        <Section title="이행상 도전 과제">
          <div style={blurStyle(isLocked)}>
          {s.implementationChallenges.map((ch, i) => (
            <ChallengeBlock key={i} ch={ch} />
          ))}
          </div>
        </Section>
      )}
      <Divider />

      {/* 5. 향후 검토 과제 / 근거 */}
      {s.deferredQuestions.length > 0 && (
        <Section title="향후 검토 과제">
          <div style={blurStyle(isLocked)}>
          <BulletList items={s.deferredQuestions} />
          </div>
        </Section>
      )}
      <Divider />

      {s.evidenceAnchors.length > 0 && (
        <Section title="인용 · 근거 ">
          <div style={blurStyle(isLocked)}>
          <BulletList items={s.evidenceAnchors} />
          </div>
        </Section>
      )}
    </article>
    </>
  );
}

/* ======================
 * UI Components
 * ====================== */
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
      onClick={() => onOpen(pageStart + 1)} // offset -1 → +1
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
          marginBottom: 10,
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
        margin: 4,
        marginBottom: 8,
        fontSize: 14,
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

function BulletList2({
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
        margin: 4,
        marginBottom: 8,
        fontSize: 13,
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
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function BlockGroup({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 24,   // ← 여기 추가/조절
        marginBottom: 14,
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
        marginTop: 10, // ← 여기서 조절
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 5,
      }}
    >
      {children}
    </div>
  );
}

function ChallengeBlock({ ch }: { ch: EsgImplementationChallengeJson }) {
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
      {/* 문제 양상 */}
      <div
        style={{
          borderLeft: "3px solid #b7791f",
          paddingLeft: 8,
          fontWeight: 700,
          fontSize: 13,
          color: "#b7791f",
          marginBottom: 6,
        }}
      >
        문제 양상
      </div>

      <div
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          paddingLeft: 12,
          marginBottom:
            ch.why_it_matters || ch.response.length ? 14 : 0,
          color: colors.ink,
        }}
      >
        {ch.pattern}
      </div>

      {/* 영향 */}
      {ch.why_it_matters && (
        <div style={{ marginBottom: ch.response.length ? 14 : 0 }}>
          <div
            style={{
              borderLeft: "3px solid #2f855a",
              paddingLeft: 8,
              fontWeight: 700,
              fontSize: 13,
              color: "#2f855a",
              marginBottom: 6,
            }}
          >
            영향
          </div>

          <div
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              paddingLeft: 12,
              color: colors.text,
            }}
          >
            {ch.why_it_matters}
          </div>
        </div>
      )}

      {/* 대응 방향 */}
      {ch.response.length > 0 && (
        <div>
          <div
            style={{
              borderLeft: "3px solid #4b5563",
              paddingLeft: 8,
              fontWeight: 700,
              fontSize: 13,
              color: "#4b5563",
              marginBottom: 6,
            }}
          >
            대응 방향
          </div>

          <div style={{ paddingLeft: 12 }}>
            <BulletList2 items={ch.response} small />
          </div>
        </div>
      )}
    </div>
  );
}




// 1) 컴포넌트 추가/수정 (파일 하단 UI Components 근처에 위치)

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

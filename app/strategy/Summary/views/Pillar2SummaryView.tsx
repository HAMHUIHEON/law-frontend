// law-frontend/app/strategy/Summary/views/Pillar2SummaryView.tsx

"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../../StrategyUIContext";
import {
  adaptPillar2ExecSummaryBlocks,
  Pillar2ExecSummarySourceBlocksVM,
  Pillar2MainRuleJson,
  Pillar2QuantitativeParameterJson,
  Pillar2ImplementationChallengeJson,
  Pillar2ElectionOrSafeHarbourJson,
  Pillar2DefinitionJson,
} from "../adapters/Pillar2Blocks.adapter";
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
};

export function Pillar2SummaryView({ bookId }: { bookId: string }) {
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

  const [vm, setVm] = useState<Pillar2ExecSummarySourceBlocksVM | null>(null);
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
        const adapted = adaptPillar2ExecSummaryBlocks(json);
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
      <div
        style={{
          padding: 48,
          color: colors.muted,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        {error ?? "요약을 불러오는 중…"}
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

  const p = block.pillar2;

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
        background: "#ffffff",
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

      <header
        style={{
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: `1px solid ${colors.line}`,
        }}
      ><h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {block.sectionTitle}
        </h1>
      </header>

      {block.definitions.length > 0 && (
        <>
        <Section title="용어 정의">
        <div style={{ position: "relative" }}>
        <div style={blurStyle(isLocked)}>
        <CollapsibleBlockGroup
            items={block.definitions}
            renderItem={(d, i) => <DefinitionBlock key={i} d={d} />}
        />
          </div>
          {/* 🔒 잠금 오버레이 + CTA */}
          {isLocked && (
            <div style={lockOverlayStyle}>
              <p style={{ fontSize: 14, fontWeight: 600, textAlign: "center" }}>
                이 용어 해설은
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
          </div>
        </Section>
        </>
      )}

      {(p.structuralRole || p.coreMessage) && (
        <Section title="GloBE 규칙 체계 내 해당 섹션의 역할">
          <div style={{ position: "relative" }}>
          <div style={blurStyle(isLocked)}>
          {p.structuralRole && (
            <p style={{ marginTop: 0 }}>{p.structuralRole}</p>
          )}
          {/* 미세 구분선 */}
          <div
            style={{
              borderTop: `1px dashed ${colors.line}`,
              margin: "10px 0",
            }}
          />
          <Section title="핵심 내용">
          {p.coreMessage && (
            <p style={{ marginTop: 8, fontSize: 14, fontWeight: 400 }}>
              {p.coreMessage}
            </p>
          )}
        </Section>
        </div>
          {/* 🔒 잠금 오버레이 + CTA */}
          {isLocked && (
            <div style={lockOverlayStyle}>
              <p style={{ fontSize: 14, fontWeight: 600, textAlign: "center" }}>
                이 내용은
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
        </div>
        </Section>
      )}
      <Divider />

      {p.keyConcepts.length > 0 && (
        <Section title="주요 개념">
        <div style={blurStyle(isLocked)}>
        <CollapsibleBlockGroup
            items={p.keyConcepts}
            renderItem={(k, i) => (
            <Block key={i} title={k.label} text={k.description} />
            )}
        />
        </div>
        </Section>
      )}
      <Divider />

      {p.mainRules.length > 0 && (
        <Section title="주요 규칙">
          <div style={blurStyle(isLocked)}>
          <CollapsibleBlockGroup
            items={p.mainRules}
            renderItem={(r, i) => (
              <div key={i}>
                <MainRuleBlock r={r} />

                {/* ✅ 마지막 항목이 아닐 때만 점선 */}
                {i < p.mainRules.length - 1 && (
                  <div
                    style={{
                      borderTop: `1px dashed ${colors.line}`,
                      margin: "10px 0",
                    }}
                  />
                )}
              </div>
            )}
          />
          </div>
        </Section>
      )}

      <Divider />


      {p.quantitativeParameters.length > 0 && (
        <Section title="정량 기준">
          <div style={blurStyle(isLocked)}>
          <CollapsibleBlockGroup
            items={p.quantitativeParameters}
            renderItem={(q, i) => (
              <div key={i}>
                <QuantitativeBlock q={q} />

                {/* ✅ 마지막 항목이 아닐 때만 점선 */}
                {i < p.quantitativeParameters.length - 1 && (
                  <div
                    style={{
                      borderTop: `1px dashed ${colors.line}`,
                      margin: "10px 0",
                    }}
                  />
                )}
              </div>
            )}
          />
          </div>
        </Section>
      )}

      <Divider />


      {p.interactionsAndDependencies.length > 0 && (
        <Section title="연계·의존 관계">
        <div style={blurStyle(isLocked)}>
        <CollapsibleBlockGroup
            items={p.interactionsAndDependencies}
            renderItem={(d, i) => (
            <Block
                key={i}
                title={d.related_section_or_article}
                text={d.description}
            />
            )}
        />
        </div>
        </Section>
      )}
      <Divider />

      {p.electionsAndSafeHarbours.length > 0 && (
        <Section title="선택 규정 및 세이프하버">
        <div style={blurStyle(isLocked)}>
        <CollapsibleBlockGroup
            items={p.electionsAndSafeHarbours}
            renderItem={(e, i) => <ElectionBlock key={i} e={e} />}
        />
        </div>
        </Section>
      )}
      <Divider />

      {p.implementationChallenges.length > 0 && (
        <Section title="이행상 쟁점">
          <div style={blurStyle(isLocked)}>
          <CollapsibleBlockGroup
            items={p.implementationChallenges}
            renderItem={(c, i) => (
              <div key={i}>
                <ChallengeBlock c={c} />

                {/* ✅ 마지막 항목이 아닐 때만 점선 */}
                {i < p.implementationChallenges.length - 1 && (
                  <div
                    style={{
                      borderTop: `1px dashed ${colors.line}`,
                      margin: "10px 0",
                    }}
                  />
                )}
              </div>
            )}
          />
          </div>
        </Section>
      )}

      <Divider />

      {p.openPolicyQuestions.length > 0 && (
        <Section title="열린 정책 쟁점">
          <div style={blurStyle(isLocked)}>
          <BulletList items={p.openPolicyQuestions} />
        </div>
        </Section>
      )}
    </article>
          </>
  );
}

/* ======================
 * Components
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
    <section style={{ marginTop: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 3,
            height: 18,
            background: colors.accent,
            borderRadius: 2,
          }}
        />
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            margin: 0,
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

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <p style={{ margin: 0 }}>{text}</p>
    </div>
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
        fontSize: 13.5,
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

function MainRuleBlock({ r }: { r: Pillar2MainRuleJson }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600 }}>{r.label}</div>
      <p style={{ margin: "4px 0 14px 0" }}>{r.description}</p>
      
      {r.conditions.length > 0 && (
        <>
          <SubLabel>적용 요건</SubLabel>
          <BulletList items={r.conditions} />
        </>
      )}

      {r.outcomes.length > 0 && (
        <>
          <SubLabel>결과</SubLabel>
          <BulletList items={r.outcomes} />
        </>
      )}
    </div>
  );
}

function QuantitativeBlock({
  q,
}: {
  q: Pillar2QuantitativeParameterJson;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600 }}>{q.name}</div>
      <p style={{ margin: "4px 0 14px 0" }}>{q.description}</p>
      <div style={{ fontSize: 13, color: colors.muted }}>
        기준값: {q.default_value_or_threshold}
      </div>
      {q.notes.length > 0 && <BulletList items={q.notes} />}
    </div>
  );
}

function ElectionBlock({
  e,
}: {
  e: Pillar2ElectionOrSafeHarbourJson;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600 }}>{e.label}</div>
      <p style={{ margin: "4px 0" }}>{e.description}</p>
      <div style={{ fontSize: 13, color: colors.muted }}>
        적용 대상: {e.who_can_use}
      </div>
      {e.conditions.length > 0 && (
        <>
          <SubLabel>요건</SubLabel>
          <BulletList items={e.conditions} />
        </>
      )}
      {e.effects.length > 0 && (
        <>
          <SubLabel>효과</SubLabel>
          <BulletList items={e.effects} />
        </>
      )}
    </div>
  );
}

function ChallengeBlock({
  c,
}: {
  c: Pillar2ImplementationChallengeJson;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600 }}>{c.topic}</div>
      <p style={{ margin: "6px 0 16px", fontSize: 13, color: colors.muted }}>
        {c.risks_if_ignored}
      </p>
      {c.book_guidance.length > 0 && (
        <BulletList items={c.book_guidance} />
      )}
    </div>
  );
}

function DefinitionBlock({ d }: { d: Pillar2DefinitionJson }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 600 }}>{d.term}</div>
      <p style={{ margin: "4px 0" }}>{d.definition}</p>
      {d.notes.length > 0 && <BulletList items={d.notes} />}
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: colors.muted,
        marginTop: 6,
        marginBottom: 2,
      }}
    >
      {children}
    </div>
  );
}


function CollapsibleBulletList({
  items,
  previewCount = 2,
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
function CollapsibleBlockGroup<T>({
  items,
  previewCount = 2,
  renderItem,
}: {
  items: T[];
  previewCount?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!items || items.length === 0) return null;

  const visibleItems = open ? items : items.slice(0, previewCount);
  const hasMore = items.length > previewCount;

  return (
    <>
      {visibleItems.map((item, idx) => renderItem(item, idx))}

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

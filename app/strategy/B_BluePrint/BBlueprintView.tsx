//app/strategy/B_BluePrint/BBlueprintView.tsx
"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../StrategyUIContext"; 
import {
  BlueprintIndex,
  Blueprint,
  BlueprintAction,
  DecisionPoint,
  EscalationPath,
} from "./blueprint.types";
import { adaptBlueprintResponse } from "./blueprint.adapters";
import { getBlueprintById } from "./blueprint.index";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";

/* ========================
   MAIN VIEW
======================== */

const text = {
  h1: { fontSize: 20, fontWeight: 600 },
  section: { fontSize: 18, fontWeight: 600 },

  blockTitle: { fontSize: 15, fontWeight: 600 },   // 행동/판단 핵심 문장
  body: { fontSize: 14, lineHeight: 1.8 },         // 설명
  meta: { fontSize: 13, lineHeight: 1.7 },         // 조건/결과/자료
  label: { fontSize: 12, fontWeight: 600 },        // 행동/목적/조건 라벨
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export function BBlueprintView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  
  const [index, setIndex] = useState<BlueprintIndex | null>(null);
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const { selectedBlueprintBlockId, setSelectedBlueprintBlockId } = useStrategyUI();
  const [flowStageMap, setFlowStageMap] = useState<Record<string, string>>({});
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  useRecordStrategyTrace({
    userId,
    parentType: "strategy",
    parentId: bookId,
    traceType: "reasoning",
    traceId: selectedBlueprintBlockId,
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const res = await fetch(
        `${API_BASE}/api/publications/b/${bookId}/flow`
      );
      const raw = await res.json();

      if (cancelled) return;

      const map: Record<string, string> = {};

      raw.flow_blocks?.forEach((b: any) => {
        if (b.block_id && b.flow_stage) {
          map[b.block_id] = b.flow_stage;
        }
      });

      setFlowStageMap(map);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [bookId]);


  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const res = await fetch(
        `${API_BASE}/api/publications/b/${bookId}/blueprints`
      );
      const raw = await res.json();
      const adapted = adaptBlueprintResponse(raw);

      if (!cancelled) {
        setIndex(adapted);

    // ✅ 처음 진입 시 선택값이 없으면 첫 블록을 컨텍스트에 넣어준다
    if (!selectedBlueprintBlockId) {
          setSelectedBlueprintBlockId(adapted.blockIds[0] ?? null);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

const [saving, setSaving] = useState(false);
const handleSaveBlock = async () => {
  if (!userId || !selectedBlueprintBlockId || saving) return;

  setSaving(true);
  try {
    await saveThought({
      parentType: "strategy",
      parentId: bookId,
      targetType: "reasoning",
      targetId: selectedBlueprintBlockId,
    });
  } finally {
    setSaving(false);
  }
};
  if (!index) {
    return <div style={{ padding: 48 }}>조사 운영 설계도를 불러오는 중…</div>;
  }

  // ✅ 현재 선택은 컨텍스트를 ‘그대로’ 사용
  const activeBlockId = selectedBlueprintBlockId ?? index.blockIds[0] ?? null;
  if (!activeBlockId) return null;

  const blueprint = getBlueprintById(index, activeBlockId);
  if (!blueprint) return null;

  const stageLabel = flowStageMap[activeBlockId];

  
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
            onClick={handleSaveBlock}
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
        lineHeight: 1.8,
        color: "#111827",
      }}
    >      
    
      {/* Block ID only */}
    <h1
    style={{
        fontSize: 20,
        fontWeight: 600,
        marginBottom: 40,
        display: "flex",
        alignItems: "center",
        gap: 10,
    }}
    >
    <span
        style={{
        width: 4,
        height: 28,
        background: "#6d28d9",
        borderRadius: 2,
        display: "inline-block",
        }}
    />
      {blueprint.blockId}
      {stageLabel && (
        <span style={{ fontSize: 24 }}>
          · {stageLabel}
        </span>
      )}
    </h1>


      <Section title="착수·개시 계기">
        <ParagraphList items={blueprint.entryTriggers} />
      </Section>

        <Section title="조사 전략">
        <StrategyList actions={blueprint.actions} />
        </Section>


      <Section title="의사 결정">
        {blueprint.decisionPoints.map((d, i) => (
          <DecisionBlock key={i} decision={d} />
        ))}
      </Section>

      <Section title="이관·확대 경로">
        {blueprint.escalationPaths.map((e, i) => (
          <EscalationBlock key={i} path={e} />
        ))}
      </Section>

      <Section title="중단 기준">
        <TightList items={blueprint.stopLines} />
      </Section>

      <Section title="필수 산출물">
        <TightList items={blueprint.requiredArtifacts} />
      </Section>
    </article>
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
    <section style={{ marginBottom: 56 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
function ParagraphList({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((t, i) => (
        <li
          key={i}
          style={{
            marginBottom: 16,
            paddingLeft: 16,
            borderLeft: "3px solid #e5e7eb",
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function StrategyList({ actions }: { actions: BlueprintAction[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? actions : actions.slice(0, 1);

  return (
    <>
      {visible.map((action, i) => (
        <div key={i}>
          <ActionBlock action={action} />

          {/* 🔑 블록 사이에만 divider */}
          {i < visible.length - 1 && (
            <div
              style={{
                borderBottom: "1px solid #e5e7eb",
                marginBottom: 32,
              }}
            />
          )}
        </div>
      ))}

      {actions.length > 2 && (
        <div
          style={{
            marginTop: 8,   // ← 이제 이게 제대로 먹힘
          }}
        >
          <div
            onClick={() => setExpanded(!expanded)}
            style={{
              fontSize: 13,
              color: "#6d28d9",
              cursor: "pointer",
            }}
          >
            {expanded ? "조사 전략 접기" : "조사 전략 더 보기"}
          </div>
        </div>
      )}
    </>
  );
}



function ActionBlock({ action }: { action: BlueprintAction }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* 행동 */}
      <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
        행동
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
        {action.text}
      </div>

      {/* 목적 */}
      <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
        목적
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.8, color: "#374151", marginBottom: 16 }}>
        {action.purpose}
      </div>

      {/* 조건 */}
      <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
        조건
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.7, color: "#4b5563" }}>
        {action.prerequisites.map((p, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            · {p}
          </div>
        ))}
      </div>
    </div>
  );
}

function DecisionBlock({ decision }: { decision: DecisionPoint }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        marginBottom: 40,
        paddingBottom: 24,
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {/* 판단 */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          marginBottom: 4,
        }}
      >
        판단
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          lineHeight: 1.6,
          marginBottom: 14,
        }}
      >
        {decision.condition}
      </div>

      {/* 선택지 */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          marginBottom: 6,
        }}
      >
        선택지
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "#374151",
          marginBottom: 12,
        }}
      >
        {decision.options.map((o, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            · {o}
          </div>
        ))}
      </div>

      {/* 결과 영향 토글 */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          fontSize: 13,
          color: "#6d28d9",
          cursor: "pointer",
          marginBottom: open ? 8 : 0,
        }}
      >
        {open ? "결과 영향 숨기기" : "결과 영향 보기"}
      </div>

      {/* 결과 영향 (접힘) */}
      {open && (
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: "#4b5563",
          }}
        >
          {decision.implications}
        </div>
      )}
    </div>
  );
}



function EscalationBlock({ path }: { path: EscalationPath }) {
  return (
    <div
      style={{
        marginBottom: 40,
        paddingBottom: 24,
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {/* 이관 사유 */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          marginBottom: 4,
        }}
      >
        이관 사유
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          lineHeight: 1.6,
          marginBottom: 14,
        }}
      >
        {path.trigger}
      </div>

      {/* 대상 기관 */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          marginBottom: 4,
        }}
      >
        대상 기관
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "#374151",
          marginBottom: 16,
        }}
      >
        {path.target}
      </div>

      {/* 준비 자료 */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          marginBottom: 6,
        }}
      >
        준비 자료
      </div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: "#4b5563",
        }}
      >
        <DocDots items={path.requirements} />
      </div>
    </div>
  );
}

function TightList({ items }: { items: string[] }) {
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
      }}
    >
      {items.map((t, i) => (
        <li
          key={i}
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#4b5563",
            marginBottom: 8,
            display: "flex",
            gap: 8,
          }}
        >
          <span style={{ color: "#6b7280" }}>·</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function DocDots({ items }: { items: string[] }) {
  return (
    <div
      style={{
        fontSize: 13,
        lineHeight: 1.7,
        color: "#4b5563",
      }}
    >
      {items.map((t, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          · {t}
        </div>
      ))}
    </div>
  );
}

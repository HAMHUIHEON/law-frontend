//app/strategy/B_APP_MAP/BApplicationMapView.tsx
"use client";

import { useEffect, useState } from "react";
import { useStrategyUI } from "../StrategyUIContext"; 

import {
  adaptOperationalMap,
} from "./map.adapters";
import {
  OperationalMapViewModel,
  RawOperationalMap,
} from "./map.types";

import { useAuth } from "@clerk/nextjs";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useSaveThought } from "@/app/hooks/useSaveThought";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export function BApplicationMapView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  const [vm, setVm] = useState<OperationalMapViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveThought = useSaveThought();
  const [showHint, setShowHint] = useState(false);


  useRecordStrategyTrace({
  userId,
  parentType: "strategy",
  parentId: bookId,
  traceType: "semantic",
  traceId: "APPLICATION_MAP",
});

const [saving, setSaving] = useState(false);
const handleSaveMap  = async () => {
  if (!userId || saving) return;

  setSaving(true);
  try {
    await saveThought({
    parentType: "strategy",
    parentId: bookId,
    targetType: "semantic",
    targetId: "APPLICATION_MAP",
    });
  } finally {
    setSaving(false);
  }
};

  useEffect(() => {
    let cancelled = false;
    console.log("DEBUG bookId =", JSON.stringify(bookId));
    console.log(
      "DEBUG URL =",
      `${API_BASE}/api/publications/b/${bookId}/operational-map`
    );

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE}/api/publications/b/${bookId}/operational-map`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const raw: RawOperationalMap = await res.json();
        const adapted = adaptOperationalMap(raw);

        if (!cancelled) {
          setVm(adapted);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("Operational Application Map을 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  /* ---------- 상태 ---------- */

  if (loading) {
    return (
      <div style={{ padding: 48, color: "#6b7280" }}>
        3단계 조사 운영 청사진을 불러오는 중…
      </div>
    );
  }

  if (error || !vm) {
    return (
      <div style={{ padding: 48, color: "#b91c1c" }}>
        {error}
      </div>
    );
  }

  /* ---------- Render ---------- */

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
            onClick={handleSaveMap}
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
          <h1
      style={{
        fontSize: 24,
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
      조사 운영 청사진
    </h1>
      {/* 1. Investigation Phases */}
      <Section title="조사 전략 수립 단계">
        <ul style={bulletStyle}>
          {vm.investigationPhases.map((p, i) => (
            <li key={i} style={liStyle}>{p}</li>
          ))}
        </ul>
      </Section>

      {/* 2. Always-on Blocks */}
      <Section title="구조적 필수 블록">
        <p style={paragraphStyle}>
          다음 블록들은 조직·사건 유형과 무관하게 기본적으로 활성화되어야 한다.
        </p>

        <BlockStrip blocks={vm.alwaysOnBlocks} />
      </Section>

      {/* 3. Conditional Blocks */}
      <Section title="조건부 활성화 블록">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {vm.conditionalBlocks.map((c, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                padding: "12px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {/* 조건 */}
              <div
                style={{
                  flex: 1,
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                {c.condition}
              </div>

              {/* 블록 */}
              <div style={{ minWidth: 200 }}>
                <BlockStrip blocks={c.blockIds} />
              </div>
            </li>
          ))}
        </ul>
      </Section>


      {/* 4. Organisational Setups */}
      <Section title="조직 역량 수준별 구성">
        <SubSection title="기본 적용 세트">
          {vm.minimumViableSetups.map((g, idx) => (
            <SetupLine key={idx} label={g.label} blocks={g.blockIds} />
          ))}
        </SubSection>

        <SubSection title="심화 적용 세트">
          {vm.advancedSetups.map((g, idx) => (
            <SetupLine key={idx} label={g.label} blocks={g.blockIds} />
          ))}
        </SubSection>
      </Section>

      {/* 5. Key Decision Bottlenecks */}
      <Section title="핵심 판단 병목 지점">
        <ul style={bulletStyle}>
          {vm.keyDecisionBottlenecks.map((b, i) => (
            <li key={i} style={liStyle}>{b}</li>
          ))}
        </ul>
      </Section>

      {/* 6. Organisational Notes */}
      <Section title="조직 설계·운영 시 유의사항">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {vm.organisationalNotes.map((n, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start", // ⭐ 핵심
                gap: 12,
                marginBottom: 12,
              }}
            >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#6b7280",
                lineHeight: "1.7",
                minWidth: 20,     // ⭐ 번호 컬럼 폭 고정
                textAlign: "right",
                marginTop: 2,     // 미세 조정 (선택)
              }}
            >
              {i + 1}.
            </span>


              <span
                style={{
                  fontSize: 14,
                  lineHeight: "1.7",
                }}
              >
                {n}
              </span>
            </li>
          ))}
        </ul>
      </Section>


      {/* 7. How to Use */}
      <Section title="조사 운영 청사진 활용 방법">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {vm.usageGuide.map((g, i) => (
            <li
              key={i}
              style={{
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                상황 {i + 1}
              </div>

              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "#111827",
                }}
              >
                {g}
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </article>
     </>
  );
}

const bulletStyle = {
  listStyleType: "disc",
  paddingLeft: 18,
  margin: 0,
};

const liStyle = {
  marginBottom: 10,
  fontSize: 14,
  lineHeight: 1.7,
};

const paragraphStyle = {
  fontSize: 14,
  marginBottom: 12,
};

const monoLine = {
  fontSize: 13,
  color: "#374151",
};

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  deep: "#6d28d9",
  soft: "#ede9fe",
  line: "#e5e7eb",
};

function HoverableBlock({ id }: { id: string }) {
  const [hover, setHover] = useState(false);
  const { setViewMode, setSelectedBlueprintBlockId } = useStrategyUI();

  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}

      // ✅ 클릭만 연결
      onClick={() => {
        setSelectedBlueprintBlockId(id);
        setViewMode("BLUEPRINTS");
      }}

      style={{
        fontSize: 11,
        padding: "4px 8px",
        borderRadius: 6,
        background: hover ? colors.soft : "#eef2f7",
        color: hover ? colors.deep : colors.ink,
        border: `1px solid ${hover ? colors.deep : "transparent"}`,
        cursor: "pointer",
        transition: "all 120ms ease",
        transform: hover ? "translateY(-1px)" : "none",

      }}
    >
      {id}
    </span>
  );
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        marginBottom: 56,
        paddingBottom: 24,
        borderBottom: "1px solid #e5e7eb",
      }}
    >
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

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function SetupLine({
  label,
  blocks,
}: {
  label: string;
  blocks: string[];
}) {
  return (
    <div
      style={{
        padding: "16px",
        marginBottom: 12,
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 6, // fastPaths랑 맞춤
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
        }}
      >
        <BlockStrip blocks={blocks} />
      </div>
    </div>
  );
}


function BlockStrip({ blocks }: { blocks: string[] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {blocks.map((b) => (
        <HoverableBlock key={b} id={b} />
      ))}
    </div>
  );
}

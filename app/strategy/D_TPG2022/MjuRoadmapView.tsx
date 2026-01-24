// law-frontend/app/strategy/JU/views/MjuRoadmapView.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { useStrategyUI } from "../StrategyUIContext";
import {
  adaptMjuAssignmentsFromApi,
  MjuTypesVM,
  MjuTypeVM,
  MjuBlockRefVM,
} from "./adapters/MjuAssignments.adapter";
import { useAuth } from "@clerk/nextjs";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useSaveThought } from "@/app/hooks/useSaveThought";



const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  bg: "#ffffff",
  accent: "#6d28d9",
  deep: "#4c5159ff",
  text:"#111827",
};

interface MjuRoadmapViewProps {
  bookId: string;
}

export function MjuRoadmapView({ bookId }: MjuRoadmapViewProps) {
  const { userId } = useAuth();
  const { setViewMode, setSelectedJudgeId } = useStrategyUI();

  const [vm, setVm] = useState<MjuTypesVM | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔹 type별 섹션 ref
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [collapsed, setCollapsed] = useState(false);
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  useRecordStrategyTrace({
    userId,
    parentType: "strategy",
    parentId: bookId,
    traceType: "reasoning",
    traceId: currentBlockId,
  });

  const [saving, setSaving] = useState(false);
  // 저장 버튼 클릭 핸들러
  const handleSaveMjudge = async () => {
    if (!userId || !currentBlockId || saving) return; // selectedRiskTypologyId가 null이면 처리하지 않음

    setSaving(true); // saving 상태 시작
    try {
      await saveThought({
        parentType: "strategy",
        parentId: bookId,
        targetType: "reasoning",  // 예: "reasoning"은 상황에 맞게 수정
        targetId: currentBlockId, // selectedRiskTypologyId는 이제 null이 아님
      });
    } finally {
      setSaving(false); // saving 상태 끝
    }
  };

  useEffect(() => {
    const onScroll = () => {
      setCollapsed(window.scrollY > 80);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setError(null);

        const res = await fetch(
          `http://127.0.0.1:8000/api/publications/d/${bookId}/mju_list`
        );

        if (!res.ok) {
          throw new Error(`MJU 로드맵 요청 실패 (${res.status})`);
        }

        const raw = await res.json();
        const adapted = adaptMjuAssignmentsFromApi(raw);

        if (!cancelled) {
          setVm(adapted);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "MJU 로드맵을 불러오는 중 오류가 발생했습니다."
          );
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  if (error) {
    return <Message text={error} />;
  }

  if (!vm) {
    return <Message text="판단 구조 로드맵을 불러오는 중…" />;
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
            onClick={handleSaveMjudge}
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
        paddingTop: 0,
        lineHeight: 1.7,
        color: colors.ink,
      }}
    >
      {/* =========================
          상단 MJU 타입 인덱스
         ========================= */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(4px)",
          borderBottom: `1px solid ${colors.line}`,
          padding: collapsed ? "6px 0 8px" : "14px 0 18px",
          marginBottom: collapsed ? 12 : 28,
          transition: "all 160ms ease",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: colors.ink,
              padding: "6px",

            }}
          >
            판단 구조 로드맵
          </div>
          
          <div
            style={{
              fontSize: 12,
              color: colors.muted,
            }}
          >
            판단 유형 기준 탐색
          </div>
        </div>

        {/* Type index */}
        <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              maxHeight: collapsed ? 0 : 200,
              opacity: collapsed ? 0 : 1,
              overflow: "hidden",
              transition: "all 160ms ease",
            }}
          >
          {vm.types.map((type) => (
            <button
              key={type.mjuTypeId}
              onClick={() => {
                sectionRefs.current[type.mjuTypeId]?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${colors.line}`,
                background: "#fff",
                color: colors.text,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.accent;
                e.currentTarget.style.color = colors.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.line;
                e.currentTarget.style.color = colors.text;
              }}
            >
              {type.mjuTypeName}
            </button>
          ))}
        </div>

        {/* 👇 바로 여기 */}
        {collapsed && (
          <div
            onClick={() => setCollapsed(false)}
            style={{
              fontSize: 11,
              color: colors.muted,
              marginTop: 4,
              cursor: "pointer",
            }}
          >
            유형 탐색 보기
          </div>
        )}
      </div>


      {/* =========================
          본문: 타입별 카드 나열
         ========================= */}
      {vm.types.map((type) => (
        <MjuTypeSection
          key={type.mjuTypeId}
          type={type}
          sectionRef={(el) => {
            sectionRefs.current[type.mjuTypeId] = el;
          }}
          onSelectBlock={(blockId) => {
            setCurrentBlockId(blockId);   // ⭐ 이 줄
            setSelectedJudgeId(blockId);
            setViewMode("MJU");
          }}
        />
      ))}
    </article>
    </>
  );
}

/* =========================
   Type Section
   ========================= */

function MjuTypeSection({
  type,
  sectionRef,
  onSelectBlock,
}: {
  type: MjuTypeVM;
  sectionRef: (el: HTMLDivElement | null) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  return (
    <section ref={sectionRef} style={{ marginBottom: 48 }}>
      <h2
        style={{
          paddingLeft: 8,
          fontWeight: 700,
          fontSize: 22,
          color: "#2f855a",
          marginBottom: 12,
        }}
      >
        {type.mjuTypeName}
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {type.blocks.map((block) => (
          <MjuBlockCard
            key={block.blockId}
            block={block}
            onClick={() => onSelectBlock(block.blockId)}
          />
        ))}
      </div>
    </section>
  );
}

/* =========================
   Block Card
   ========================= */

function MjuBlockCard({
  block,
  onClick,
}: {
  block: MjuBlockRefVM;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `1px solid ${colors.line}`,
        borderRadius: 10,
        padding: 16,
        background: colors.bg,
        cursor: "pointer",
        transition: "all 120ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.line;
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: colors.muted,
          marginBottom: 6,
        }}
      >
        {block.blockId}
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {block.title}
      </div>

      <div
        style={{
          fontSize: 13,
          color: colors.ink,
          marginBottom: 8,
        }}
      >
        {block.coreQuestion}
      </div>

      <div
        style={{
          fontSize: 12,
          color: colors.muted,
        }}
      >
        p.{block.pageStart}–{block.pageEnd}
      </div>
    </div>
  );
}

/* =========================
   Message
   ========================= */

function Message({ text }: { text: string }) {
  return (
    <div style={{ padding: 48, color: colors.muted, textAlign: "center" }}>
      {text}
    </div>
  );
}

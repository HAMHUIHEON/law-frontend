// law-frontend/app/strategy/B_FLOW/BFlowView.tsx

"use client";

import { useEffect, useState } from "react";
import { adaptFlowResponse } from "./flow.adapters";
import { FlowViewModel, RawFlowResponse, FlowBlock } from "./flow.types";
import { useStrategyUI } from "../StrategyUIContext";
import { PAGE_OFFSET_BY_BOOK } from "../pageoffset";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";


export function BFlowView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  const [vm, setVm] = useState<FlowViewModel | null>(null);
  const { setViewMode, setBriefPage } = useStrategyUI();
  const offset = PAGE_OFFSET_BY_BOOK[bookId] ?? 0;
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  // ✅ 사고 트레이스 (state 기준, hook 규칙 100% 준수)
  useRecordStrategyTrace({
    userId,
    parentType: "strategy",   // ⭐ 이 줄 추가
    parentId: bookId,
    traceType: "reasoning",
    traceId: currentBlockId,
  });

  const [saving, setSaving] = useState(false);
  // 저장 버튼 클릭 핸들러
  const handleSaveCurrent = async () => {
    if (!userId || !currentBlockId || saving) return; // userId 없거나 saving 중이면 처리하지 않음

    setSaving(true); // saving 상태 시작
    try {
      await saveThought({
        parentType: "strategy",
        parentId: bookId,
        targetType: "reasoning",  // 예: "reasoning"은 상황에 맞게 수정
        targetId: currentBlockId, // 현재 선택된 블록 ID
      });
    } finally {
      setSaving(false); // saving 상태 끝
    }
  };

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/publications/b/${bookId}/flow`)
      .then(async (res) => {
        const json = await res.json();
        console.log("B1 FLOW RESPONSE =", json);
        return json as RawFlowResponse;
      })
      .then((raw) => setVm(adaptFlowResponse(raw)));
  }, [bookId]);


  if (!vm) {
    return (
      <div style={{ padding: 48, color: "#6b7280" }}>
        조사 흐름 설계도를 불러오는 중…
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
            onClick={handleSaveCurrent}
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

  <article style={{ maxWidth: 960, lineHeight: 1.8, color: "#111827" }}>
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
      조사 흐름 설계도
    </h1>

    {vm.blocks.map((block) => (
      <FlowBlockCard
        key={block.id}
        block={block}
        onView={() => {
        // ✅ 여기서만 사고 발생
        setCurrentBlockId(block.id);
        }}
        onOpenSource={() => {
          setCurrentBlockId(block.id); // 🔥 source 열어도 사고로 인정
          setBriefPage(block.pageStart - offset);
          setViewMode("BRIEFS");
        }}
      />
    ))}
  </article>
  </>
);
}

function FlowBlockCard({
  block,
  onOpenSource,
  onView,
}: {
  block: FlowBlock;
  onOpenSource: () => void;
  onView: () => void;
}) {
  return (
    <section
      onClick={onView}
      style={{
        marginBottom: 40,
        paddingBottom: 24,
        borderBottom: "1px solid #e5e7eb",
        cursor: "pointer",
      }}
    >
      {/* 블록 ID */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          marginBottom: 6,
        }}
      >
        {block.id}
      </div>

      {/* 단계명 */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {block.stage}
      </div>

      {/* 목적 */}
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "#374151",
          marginBottom: 12,
        }}
      >
        {block.purpose}
      </div>

      {/* 원문 보기 */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // ✅ 카드 클릭과 분리
          onOpenSource();
        }}
        style={{
          fontSize: 13,
          color: "#6d28d9",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        📄 원문 읽기 · {block.pageRangeLabel}
      </button>
    </section>
  );
}


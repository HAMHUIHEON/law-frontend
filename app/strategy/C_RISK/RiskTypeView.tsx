// law-frontend/app/strategy/C_RISK/RiskTypesView.tsx

"use client";

import { useEffect, useState } from "react";
import { getRiskTypologyRaw } from "./risk.api";
import { adaptRiskTypology } from "./adapters";
import { RiskTypologyArticleVM } from "./adapters";
import { useStrategyUI } from "../StrategyUIContext";
import { PAGE_OFFSET_BY_BOOK } from "../pageoffset";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";


export function RiskTypesView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  const [items, setItems] = useState<RiskTypologyArticleVM[]>([]);
  const [current, setCurrent] = useState<RiskTypologyArticleVM | null>(null);
  const offset = PAGE_OFFSET_BY_BOOK[bookId] ?? 0;
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  const {
    selectedRiskTypologyId,
    setSelectedRiskTypologyId,
    setViewMode,
    setBriefPage,
  } = useStrategyUI();

  useRecordStrategyTrace({
    userId,
    parentType: "strategy",
    parentId: bookId,
    traceType: "semantic",
    traceId: selectedRiskTypologyId,
  });

  const [saving, setSaving] = useState(false);
  // 저장 버튼 클릭 핸들러
  const handleSaveTypology = async () => {
    if (!userId || !selectedRiskTypologyId || saving) return; // selectedRiskTypologyId가 null이면 처리하지 않음

    setSaving(true); // saving 상태 시작
    try {
      await saveThought({
        parentType: "strategy",
        parentId: bookId,
        targetType: "semantic",  // 예: "reasoning"은 상황에 맞게 수정
        targetId: selectedRiskTypologyId, // selectedRiskTypologyId는 이제 null이 아님
      });
    } finally {
      setSaving(false); // saving 상태 끝
    }
  };

  // 1️⃣ 데이터 로딩
  useEffect(() => {
    let cancelled = false;

    getRiskTypologyRaw(bookId)
      .then(adaptRiskTypology)
      .then((vm) => {
        if (cancelled) return;

        setItems(vm.typologies);

        const first = vm.typologies[0] ?? null;
        setCurrent(first);
        setSelectedRiskTypologyId(first?.id ?? null);
      })
      .catch((err) => {
        console.error("Failed to load risk typologies:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [bookId, setSelectedRiskTypologyId]);

  // 2️⃣ 사이드바 선택 변경
  useEffect(() => {
    if (!selectedRiskTypologyId) return;

    const found = items.find((t) => t.id === selectedRiskTypologyId);
    if (found) setCurrent(found);
  }, [selectedRiskTypologyId, items]);

  if (!current) {
    return (
      <div style={{ padding: 48, color: "#6b7280" }}>
        리스크 유형을 불러오는 중…
      </div>
    );
  }

  // 3️⃣ 문서 렌더 (정보 풀세트)
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
            onClick={handleSaveTypology}
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
      {/* 제목 */}
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 4,
            height: 20,
            background: "#6d28d9",
            borderRadius: 2,
            display: "inline-block",
          }}
        />
        {current.id} · {current.title}
      </h1>

      {/* 메타 */}
      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => {
            setBriefPage(current.page.start - offset);
            setViewMode("BRIEFS");
          }}
          style={{
            fontSize: 12,
            color: "#6d28d9",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          📄 원문 읽기 · {current.page.label}
        </button>
      </div>

      {/* 🔹 Crime Tags 복구 */}
      {current.tags.crime.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {current.tags.crime.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 13,
                padding: "3px 10px",
                borderRadius: 999,
                background: "#f3f4f6",
                color: "#374151",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {/* 원문 리스트들 */}
      {/* 왜 지금 중요한가 */}
      <section style={{ marginBottom: 40, lineHeight: 2.0 }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          왜 지금 중요한가
        </h3>
        <div style={{ paddingLeft: 10 }}>
        <div
          style={{
            paddingLeft: 24,
            borderLeft: "3px solid #6d28d9",
            color: "#374151",
          }}
        >
          <p>{current.whyNow.text}</p>
        </div>
        </div>
      </section>

      {/* 범죄 구조·작동 방식 */}
      <section style={{ marginBottom: 48 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          범죄 구조·작동 방식
        </h3>
        <div style={{ paddingLeft: 12 }}>
        {current.sections.structuralPattern.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 12,
              color: "#374151",
            }}
          >
            <span
              style={{
                minWidth: 20,
                fontWeight: 400,
              }}
            >
              {idx + 1}.
            </span>
            <span>{item}</span>
          </div>
        ))}
        </div>
      </section>

      {/* 제도적·환경적 가능 요인 */}
      <section style={{ marginBottom: 48 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          제도적·환경적 가능 요인
        </h3>

        <ul
          style={{
            paddingLeft: 26,              // ← 핵심
            listStyleType: "disc",
            listStylePosition: "outside",
            color: "#374151",
          }}
        >
          {current.sections.commonEnablers.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 10,
              paddingLeft: 8,     // ← 🔥 이게 핵심
             }}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* 주요 탐지 신호 */}
      <section style={{ marginBottom: 56 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          주요 탐지 신호
        </h3>
        <div style={{ paddingLeft: 10 }}>
        {current.sections.detectionSignals.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "flex-start",  // ← 중요
            gap: 8,
            marginBottom: 10,
            color: "#374151",
          }}
        >
          <span
            style={{
              minWidth: 24,            // ← 고정 폭
              color: "#6b7280",
              whiteSpace: "nowrap",
            }}
          >
            🚨
          </span>
          <span style={{ lineHeight: 1.6 }}>
            {item}
          </span>
        </div>
        ))}
        </div>
      </section>

    </article>
    </>
  );
}

/* ------------------------------
   하위 컴포넌트
-------------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
        {title}
      </h3>

      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: 12,
            paddingLeft: 16,
            borderLeft: "2px solid #e5e7eb",
            color: "#374151",
          }}
        >
          {item}
        </div>
      ))}
    </section>
  );
}

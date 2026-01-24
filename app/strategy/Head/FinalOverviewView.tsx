// app/strategy/Head/FinalOverviewView.tsx

"use client";

import { useEffect, useState } from "react";
import {
  adaptFinalOverview,
  FinalOverviewVM,
  FinalOverviewResponse,
} from "./adapters/finalOverview.adapter";
import { useAuth } from "@clerk/nextjs";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useSaveThought } from "@/app/hooks/useSaveThought";



export function FinalOverviewView({ bookId }: { bookId: string }) {
  const { userId } = useAuth();
  const [vm, setVm] = useState<FinalOverviewVM | null>(null);
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  useRecordStrategyTrace({
  userId,
  parentType: "strategy",
  parentId: bookId,
  traceType: "semantic",
  traceId: "HEAD_FINAL_OVERVIEW",
});

  const [saving, setSaving] = useState(false);
  // 저장 버튼 클릭 핸들러
  const handleSaveFinal = async () => {
    if (!userId || saving) return; // selectedRiskTypologyId가 null이면 처리하지 않음

    setSaving(true); // saving 상태 시작
    try {
      await saveThought({
        parentType: "strategy",
        parentId: bookId,
        targetType: "semantic",  // 예: "reasoning"은 상황에 맞게 수정
        targetId: "HEAD_FINAL_OVERVIEW", 
      });
    } finally {
      setSaving(false); // saving 상태 끝
    }
  };

  useEffect(() => {
    const run = async () => {
      const res = await fetch(
        `http://127.0.0.1:8000/api/publications/a/${bookId}/head-overview`
      );
      const raw: FinalOverviewResponse = await res.json();
      setVm(adaptFinalOverview(raw));
    };
    run();
  }, [bookId]);

  if (!vm) {
    return <div style={{ padding: 48 }}>불러오는 중…</div>;
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
            onClick={handleSaveFinal}
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


    <article style={{ maxWidth: 960, lineHeight: 1.8 }}>
      <Section title={vm.context.title}>
        <p>{vm.context.body}</p>
      </Section>

      <ListSection title={vm.keyFindings.title} items={vm.keyFindings.items} />
      <ListSection title={vm.risks.title} items={vm.risks.items} />
      <ListSection
        title={vm.strategicChoices.title}
        items={vm.strategicChoices.items}
      />

      <Section title={vm.conclusion.title}>
        <p>{vm.conclusion.body}</p>
      </Section>
    </article>
      </>
  );
}

/* ---------------- 작은 UI 헬퍼 ---------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
        {title}
      </h2>
      <h2 style={{ fontSize: 14, fontWeight: 400, marginBottom: 8 }}>
      {children}
      </h2>
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
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        {title}
      </h2>

      <ul
        style={{
          listStyleType: "disc", // ● 유지
          paddingLeft: 18,       // 불릿은 바깥, 텍스트는 자연스럽게
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
    </section>
  );
}

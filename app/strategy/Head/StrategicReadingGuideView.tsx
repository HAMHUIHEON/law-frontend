// law-frontend/app/strategy/Head/StrategicReadingGuideView.tsx

"use client";

import { useEffect, useState } from "react";
import {
  adaptHeadReadingGuide,
  HeadReadingGuideVM,
  StrategicReadingGuideResponse,
} from "./adapters/readingGuide.adapter";
import { useStrategyUI } from "../StrategyUIContext";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";

type Props = {
  bookId: string;
};

export function StrategicReadingGuideView({ bookId }: Props) {
  const { userId } = useAuth();
  const [vm, setVm] = useState<HeadReadingGuideVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setViewMode, setSelectedSummaryBlockId } = useStrategyUI();
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  // ✅ HEAD 뷰 진입 자체를 사고로 기록
  useRecordStrategyTrace({
    userId,
    parentType: "strategy",
    parentId: bookId,
    traceType: "semantic",
    traceId: "HEAD_READING_GUIDE",
  });

  const [saving, setSaving] = useState(false);
  // 저장 버튼 클릭 핸들러
  const handleSaveGuide = async () => {
    if (!userId || saving) return; // selectedRiskTypologyId가 null이면 처리하지 않음

    setSaving(true); // saving 상태 시작
    try {
      await saveThought({
        parentType: "strategy",
        parentId: bookId,
        targetType: "semantic",  // 예: "reasoning"은 상황에 맞게 수정
        targetId: "HEAD_READING_GUIDE", 
      });
    } finally {
      setSaving(false); // saving 상태 끝
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://127.0.0.1:8000/api/publications/a/${bookId}/head-reading-guide`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const raw: StrategicReadingGuideResponse = await res.json();
        const adapted = adaptHeadReadingGuide(raw);

        if (!cancelled) {
          setVm(adapted);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("전략 리딩 가이드를 불러오지 못했습니다.");
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

  /* ---------------- 상태 분기 ---------------- */

  if (loading) {
    return (
      <div style={{ padding: 48, color: "#6b7280" }}>
        전략 리딩 가이드를 불러오는 중…
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

  /* ---------------- Render ---------------- */

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
            onClick={handleSaveGuide}
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
      {/* Intro */}
      <section style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          {vm.intro.title}
        </h2>
        <p style={{ fontSize: 14 }}>
          {vm.intro.body}
        </p>
      </section>

      {/* Core Lines */}
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          {vm.coreLines.title}
        </h2>
          <ul
            style={{
              listStyleType: "disc",        // ● 강제
              paddingLeft: 12,              // 들여쓰기 조절
              margin: 0, 
            }}
          >
          {vm.coreLines.items.map((line, idx) => (
          <li
            key={idx}
            style={{
              marginBottom: 10,
              fontSize: 14,
              lineHeight: 1.7,
            }}>
              {line}
            </li>
          ))}
        </ul>
      </section>

      {/* Audiences */}
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          이 문서는 이렇게 활용하세요
        </h2>

      {vm.audiences.map((a) => (
        <div key={a.key} style={{ marginBottom: 28 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            {a.label}
          </h3>

          <p style={{ fontSize: 14, color: "#374151" }}>
            {a.description}
          </p>
        </div>
      ))}


      {/* Fast Reading Paths */}
      <section>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          빠른 읽기 경로
        </h2>

        {vm.fastPaths.map((path, idx) => (
          <div
            key={idx}
            style={{
              padding: "18px",
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
                lineHeight: 1.8,
                marginBottom: 6,
              }}
            >
              {path.intent}
            </div>

          {path.blocks.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {path.blocks.map((b, i) => (
                <Pill
                  key={i}
                  text={b}
                  onClick={() => {
                    setSelectedSummaryBlockId(b);
                    setViewMode("SUMMARY");
                  }}
                />
              ))}
            </div>
          )}
          </div>
        ))}
        </section>
      </section>
    </article>
          </>
  );
}
function Pill({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 12,
        background: "#f3f4f6",
        color: "#374151",
        marginRight: 8,
        marginBottom: 8,

        cursor: onClick ? "pointer" : "default",
        border: onClick ? "1px solid #e5e7eb" : "none",

        transition: "all 120ms ease",
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        e.currentTarget.style.background = "#ede9fe"; // violet-100
        e.currentTarget.style.borderColor = "#c4b5fd"; // violet-300
        e.currentTarget.style.color = "#6d28d9"; // violet-700
      }}
      onMouseLeave={(e) => {
        if (!onClick) return;
        e.currentTarget.style.background = "#f3f4f6";
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.color = "#374151";
      }}
    >
      {text}
    </span>
  );
}

//law-frontend/app/strategy/Exec/ExecDigestView.tsx

"use client";

import { useEffect, useState } from "react";
import { adaptExecDigest, ExecDigestVM, AudienceKey} from "./adapters";
import { useStrategyUI } from "../StrategyUIContext";
import { useAuth } from "@clerk/nextjs";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useSaveThought } from "@/app/hooks/useSaveThought";

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  deep: "#6d28d9",
  soft: "#ede9fe",
  line: "#e5e7eb",
};

/* ---------- 공통 UI ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 16,
          color: colors.ink,
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
        margin: "48px 0",
      }}
    />
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

/* ---------- 메인 ---------- */
export function ExecDigestView({ bookId }: { bookId: string }) {
  // ✅ 모든 Hook은 최상단
  const { userId } = useAuth();
  const [vm, setVm] = useState<ExecDigestVM | null>(null);
  const [audience, setAudience] = useState<AudienceKey>("policy_makers");
  const [openReadingMap, setOpenReadingMap] =
    useState<Record<string, boolean>>({});
  const { setViewMode, setSelectedSummaryBlockId } = useStrategyUI();
  const handleGoToSummaryBlock = (blockId: string) => {
    setSelectedSummaryBlockId(blockId);
    setViewMode("SUMMARY");
  };
  const saveThought = useSaveThought(userId);
  const [showHint, setShowHint] = useState(false);

  useRecordStrategyTrace({
  userId,
  parentType: "strategy",
  parentId: bookId,
  traceType: "semantic",
  traceId: "EXEC_DIGEST",
});

  const [saving, setSaving] = useState(false);
  // 저장 버튼 클릭 핸들러
  const handleSaveDigest = async () => {
    if (!userId || saving) return; // selectedRiskTypologyId가 null이면 처리하지 않음

    setSaving(true); // saving 상태 시작
    try {
      await saveThought({
        parentType: "strategy",
        parentId: bookId,
        targetType: "semantic",  // 예: "reasoning"은 상황에 맞게 수정
        targetId: "EXEC_DIGEST", 
      });
    } finally {
      setSaving(false); // saving 상태 끝
    }
  };

  useEffect(() => {
    const run = async () => {
      const res = await fetch(
        `http://127.0.0.1:8000/api/publications/a/${bookId}/exec-digest`
      );
      const json = await res.json();
      setVm(adaptExecDigest(json));
    };
    run();
  }, [bookId]);

  const [summaryBlockIds, setSummaryBlockIds] = useState<string[]>([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/publications/a/${bookId}/exec-summary`)
      .then((r) => r.json())
      .then((raw) => {
        const blocks = Array.isArray(raw?.executive_summary_blocks)
          ? raw.executive_summary_blocks.map((b: any) => b.block_id)
          : [];

        setSummaryBlockIds(blocks);
      });
  }, [bookId]);



  // ⬇️ 이제 여기서 early return 해도 안전
  if (!vm) {
    return <div style={{ color: colors.muted }}>다이제스트 불러오는 중…</div>;
  }


  /* ===== 1️⃣ Decision Triggers ===== */

  const decisionTriggers = vm.groups.flatMap((g) => g.decisionTriggers);

  
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
            onClick={handleSaveDigest}
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

  <article style={{ maxWidth: 960, paddingTop: 18}}>

    {/* Audience Guidance */}
    <Section title="독자별 추천 경로">
      {/* audience 선택 */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
      {vm.groups[0].audienceGuidance.map((a) => {
        const active = a.key === audience;

        return (
          <button
            key={a.key}
            onClick={() => setAudience(a.key)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 14,
              border: active
                ? `1px solid ${colors.deep}`
                : `1px solid ${colors.line}`,
              background: active ? colors.soft : "#fff",
              cursor: "pointer",
            }}
          >
            {a.label}
          </button>
        );
      })}
      </div>

      {/* 쟁점별 가이드 + 읽기 경로 */}
      {vm.groups.map((g, idx) => {
        const rm = g.readingMapByAudience[audience];
        const isOpen = openReadingMap[g.groupId];

        return (
          <div key={g.groupId} style={{ marginBottom: 28 }}>
            {/* 쟁점 힌트 */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.muted,
                marginBottom: 6,
              }}
            >
            </div>

            {/* 가이드 본문 */}
            <div style={{ fontSize: 15, lineHeight: 1.75 }}>
              {(() => {
                const text =
                  g.audienceGuidance.find((a) => a.key === audience)
                    ?.guidance ?? "";

                const match = text.match(/^(.+?\.)\s*(.*)$/);

                if (!match) {
                  return text;
                }

                const firstSentence = match[1];
                const rest = match[2];

                return (
                  <>
                    <strong style={{ fontWeight: 600 }}>
                      {firstSentence}
                    </strong>
                    {rest ? " " + rest : ""}
                  </>
                );
              })()}
            </div>

            {/* 읽기 경로 토글 */}
            {rm && (
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() =>
                    setOpenReadingMap((prev) => ({
                      ...prev,
                      [g.groupId]: !prev[g.groupId],
                    }))
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    color: colors.deep,
                    fontSize: 13,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  읽기 경로 {isOpen ? "▾" : "▸"}
                </button>

                {isOpen && (
                  <div
                    style={{
                      marginTop: 10,
                      paddingLeft: 12,
                      borderLeft: `2px solid ${colors.line}`,
                    }}
                  >
                    <div style={{ fontSize: 14, marginBottom: 6 }}>
                      <strong>논의의 출발점:</strong>
                      <div style={{ marginTop: 6 }}>
                        {rm.startHere.map((b, i) => (
                          <Pill
                            key={i}
                            text={b}
                            onClick={() => handleGoToSummaryBlock(b)}
                              />
                            ))}
                      </div>
                    </div>


                    <div style={{ fontSize: 14, marginBottom: 6 }}>
                      <strong>이어서 검토:</strong>
                      <div style={{ marginTop: 6 }}>
                      {rm.thenReview.map((b, i) => (
                        <Pill
                          key={i}
                          text={b}
                          onClick={() => handleGoToSummaryBlock(b)}
                        />
                      ))}
                      </div>
                    </div>


                    <div style={{ fontSize: 13, color: colors.muted }}>
                      {rm.why}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </Section>

    <Divider />
    
    <Section title="의사결정 트리거">
      <div style={{ display: "grid", gap: 24 }}>
        {decisionTriggers.map((t, idx) => (
          <div key={idx}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {t.condition}
            </div>

            <div style={{ fontSize: 14, color: colors.muted, marginTop: 6 }}>
              {t.whyItMatters}
            </div>

            {t.whereToVerify.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {t.whereToVerify.map((b, i) => (
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
      </div>
    </Section>

    <Divider />
  {/* One-page Takeaway */}
  <Section title="전략적 시사점">
    {vm.groups.map((g) => {
      const paragraphs = g.onePageTakeaway
        ? g.onePageTakeaway.split(/\n{2,}/) // 빈 줄 기준 문단 분리
        : [];

      return (
        <div
          key={g.groupId}
          style={{
            background: "#fafafa",
            border: `1px solid ${colors.line}`,
            borderRadius: 8,
            padding: 24,
          }}
        >
        {paragraphs.length > 0 ? (
          paragraphs.map((p, idx) => {
            // 문장 단위 분리
            const sentences = p.split(/(?<=\.)\s+/);

            // 2문장씩 묶어서 문단 생성
            const chunks: string[][] = [];
            for (let i = 0; i < sentences.length; i += 2) {
              chunks.push(sentences.slice(i, i + 2));
            }

            return (
              <div key={idx}>
                {chunks.map((chunk, ci) => (
                  <p
                    key={ci}
                    style={{
                      fontSize: 15,
                      lineHeight: 1.8,
                      marginBottom: ci === chunks.length - 1 ? 14 : 14,
                      color: colors.ink,
                    }}
                  >
                    {idx === 0 && ci === 0 ? (
                      <>
                        <strong style={{ fontWeight: 600 }}>
                          {chunk[0]}
                        </strong>
                        {chunk.length > 1 && " " + chunk[1]}
                      </>
                    ) : (
                      chunk.join(" ")
                    )}
                  </p>
                ))}
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: 14, color: colors.muted }}>
            요약이 제공되지 않았습니다.
          </div>
        )}
        </div>
      );
    })}
  </Section>
  </article>
  </>
);
}


// law-frontend/app/strategy/components/PublicationSidebar.tsx

"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStrategyUI } from "../StrategyUIContext";
import { PublicationComboBox } from "./PublicationComboBox";
import Link from "next/link";

type PublicationItem = {
  book_id: string;
  title: string;          // 한글(있으면) 표시 제목
  title_en?: string;      // 영문 원제 (추가)
};

type SummaryBlockItem = {
  block_id: string;
};
type BlueprintBlockItem = {
  block_id: string;
};

type MjuBlockItem = {
  block_id: string;
};

type ArtifactState = {
  A: boolean;
  B: {
    B1: boolean;
    B2: boolean;
    B3: boolean;
  };
  C: boolean;
  D: boolean;
};



export function PublicationSidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    selectedBookId,
    setSelectedBookId,
    viewMode,
    setViewMode,
    selectedSummaryBlockId,
    setSelectedSummaryBlockId,
    selectedBlueprintBlockId,
    setSelectedBlueprintBlockId,
    selectedRiskTypologyId,
    setSelectedRiskTypologyId,
    setBriefPage,
    selectedJudgeId,
    setSelectedJudgeId

  } = useStrategyUI();

  const router = useRouter();
  const [items, setItems] = useState<PublicationItem[]>([]);
  const [summaryBlocks, setSummaryBlocks] = useState<SummaryBlockItem[]>([]);
  const [blueprintBlocks, setBlueprintBlocks] = useState<BlueprintBlockItem[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactState | null>(null);
  const [mjuBlocks, setMjuBlocks] = useState<MjuBlockItem[]>([]);
  
  
  useEffect(() => {
    if (!selectedBookId) return;

  fetch(`http://127.0.0.1:8000/api/publications/${selectedBookId}/artifacts`)
    .then(res => res.json())
    .then(data => {
      setArtifacts(data);
    });
      
  }, [selectedBookId]);

useEffect(() => {
  if (viewMode !== "SUMMARY" || !selectedBookId) {
    setSummaryBlocks([]);
    setSelectedSummaryBlockId(null);
    return;
  }

  const run = async () => {
    const res = await fetch(
      `http://127.0.0.1:8000/api/publications/a/${selectedBookId}/exec-summary`
    );
    const json = await res.json();

    let blocks: SummaryBlockItem[] = [];

    // 1) BO 책처럼 루트가 배열인 경우
    if (Array.isArray(json)) {
      blocks = json
        .filter((b: any) => typeof b.block_id === "string")
        .map((b: any) => ({ block_id: b.block_id }));
    }
    // 2) 나머지 책: executive_summary_blocks 배열인 경우
    else if (Array.isArray(json.executive_summary_blocks)) {
      blocks = json.executive_summary_blocks
        .filter((b: any) => typeof b.block_id === "string")
        .map((b: any) => ({ block_id: b.block_id }));
    }

    setSummaryBlocks(blocks);

    // 기존 선택 유지, 없으면 첫 블록
    let nextSelected: string | null = null;

    if (
      selectedSummaryBlockId &&
      blocks.some((b) => b.block_id === selectedSummaryBlockId)
    ) {
      nextSelected = selectedSummaryBlockId;
    } else if (blocks.length > 0) {
      nextSelected = blocks[0].block_id;
    }

    setSelectedSummaryBlockId(nextSelected);
  };

  run();
}, [viewMode, selectedBookId, selectedSummaryBlockId]);


useEffect(() => {
  if (viewMode !== "BLUEPRINTS" || !selectedBookId) {
    setBlueprintBlocks([]);
    return;
  }

  const run = async () => {
    const res = await fetch(
      `http://127.0.0.1:8000/api/publications/b/${selectedBookId}/blueprints`
    );
    const json = await res.json();

    const blocks =
      Array.isArray(json.items)
        ? json.items.map((b: any) => ({
            block_id: b.block_id,
          }))
        : [];

    setBlueprintBlocks(blocks);
  };

  run();
}, [viewMode, selectedBookId]);

  const [riskTypologies, setRiskTypologies] = useState<
    { id: string }[]
  >([]);
  useEffect(() => {
    if (viewMode !== "RISK_TYPES" || !selectedBookId) {
      setRiskTypologies([]);
      return;
    }

  const run = async () => {
    const res = await fetch(
      `http://127.0.0.1:8000/api/publications/c/${selectedBookId}/typology`
    );
    const json = await res.json();

    const items =
      Array.isArray(json.risk_typology_blocks)
        ? json.risk_typology_blocks.map((b: any) => ({
            id: b.typology_id,
          }))
        : [];

    setRiskTypologies(items);
  };

    run();
  }, [viewMode, selectedBookId]);

 // MJU / JU 블록 목록 로딩 (D 영역)
  useEffect(() => {
    if (viewMode !== "MJU" || !selectedBookId) {
      setMjuBlocks([]);
      return;
    }

    const run = async () => {
        const res = await fetch(
          `http://127.0.0.1:8000/api/publications/d/${selectedBookId}/mju_blocks`
        );
      const json = await res.json();

      let blocks: MjuBlockItem[] = [];

      if (Array.isArray(json.judgement_units)) {
        blocks = json.judgement_units
          .filter((u: any) => typeof u.block_id === "string")
          .map((u: any) => ({ block_id: u.block_id }));
      }

      setMjuBlocks(blocks);

      // 기존 선택 유지, 없으면 첫 블록
      let nextSelected: string | null = null;

      if (
        selectedJudgeId &&
        blocks.some((b) => b.block_id === selectedJudgeId)
      ) {
        nextSelected = selectedJudgeId;
      } else if (blocks.length > 0) {
        nextSelected = blocks[0].block_id;
      }

      setSelectedJudgeId(nextSelected);
    };

    run();
  }, [viewMode, selectedBookId, selectedJudgeId, setSelectedJudgeId]);
  
  
  // 간행물 리스트 로딩 
  const selectedItem = items.find(
    (i) => i.book_id === selectedBookId
  );

  useEffect(() => {
    const run = async () => {
      const res = await fetch("http://127.0.0.1:8000/api/publications");
      const data = await res.json();
    setItems(
      (data.items ?? []).map((item: any) => ({
        book_id: item.book_id,
        title: item.display_title_ko ?? item.display_title_en ?? item.book_id,
        title_en: item.display_title_en ?? undefined,
      }))

    );
    };

    run();
  }, []);

  return (
    <aside
      style={{
        width: sidebarOpen ? 300 : 0,
        padding: sidebarOpen ? 16 : 0,
        overflow: "hidden",
        borderRight: sidebarOpen ? "1px solid #e5e7eb" : "none",
        background: "#fafafa",
        transition: "all 0.2s ease",
      }}
    >
      <Link href="/enter" style={{ textDecoration: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#374151",
            background: "transparent",
            padding: 0,
            marginBottom: 16,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#111827";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          🏠 홈
        </div>
      </Link>

      {/* 선택된 간행물 타이틀 */}
      {selectedItem && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
          
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#111827",
              lineHeight: 1.4,
            }}
          >
            {selectedItem.title}
          </div>

          {/* 영문 원제: ko와 다를 때만 보이게 */}
          {selectedItem.title_en && (
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
              {selectedItem.title_en}
            </div>
          )}

        </div>
      )}


      {/* 1️⃣ 간행물 선택 (Dropdown) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          문서 선택
        </div>

        <PublicationComboBox
          items={items}
          value={selectedBookId}
          onSelect={(item) => {
            setSelectedBookId(item.book_id);
            setViewMode(null); // ⭐ 기존 로직 그대로
          }}
        />

      </div>

      {/* 2️⃣ ViewMode 선택 (Radio) */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          보기 방식
        </div>

        {/* 🔄 artifacts 로딩 중 */}
        {selectedBookId && !artifacts && (
          <div style={{ fontSize: 13, color: "#9ca3af" }}>
            산출물 상태 불러오는 중…
          </div>
        )}
        {/* =========================
            A: 규범 / 정책 요약
          ========================= */}
        {artifacts?.A && (
          <SidebarSection withDivider={false}>
          <>
            {(
              [
                { mode: "HEAD", label: "전략적 이해" },
                { mode: "DIGEST", label: "독자별 가이드" },
                { mode: "SUMMARY", label: "심화 요약" },
              ] as const
            ).map(({ mode, label }) => {
              const isSummary = mode === "SUMMARY";
              const active = viewMode === mode;

              return (
                <div key={mode}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                      fontSize: 13,
                      color: selectedBookId ? "#111827" : "#9ca3af",
                      cursor: selectedBookId ? "pointer" : "not-allowed",
                    }}
                  >
                    <input
                      type="radio"
                      name="viewMode"
                      value={mode}
                      disabled={!selectedBookId}
                      checked={active}
                      onChange={() => {
                        setViewMode(mode);

                        // SUMMARY가 아니면 하위 선택 초기화
                        if (mode !== "SUMMARY") {
                          setSelectedSummaryBlockId(null);
                        }
                      }}
                    />
                    {label}
                  </label>

                  {/* SUMMARY 하위 블록 */}
                  {isSummary && active && summaryBlocks.length > 0 && (
                    <div style={inlineListStyle}>
                      {summaryBlocks.map((b) => {
                        const active = selectedSummaryBlockId === b.block_id;

                        return (
                          <div
                            key={b.block_id}
                            onClick={() => setSelectedSummaryBlockId(b.block_id)}
                            style={{
                              fontSize: 13,
                              padding: "4px 6px",
                              borderRadius: 4,
                              cursor: "pointer",
                              color: active ? "#111827" : "#6b7280",
                              background: active ? "#f3f4f6" : "transparent",
                            }}
                          >
                            {b.block_id}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </>
          </SidebarSection>
        )}

        {/* =========================
            B: 실행 엔진
          ========================= */}
        {artifacts?.B && (
          <SidebarSection withDivider={false}>
          <>
            {[
              artifacts.B.B3 && { mode: "APP_MAP", label: "1단계: 조사 운영 청사진" },
              artifacts.B.B1 && { mode: "FLOW", label: "2단계: 조사 흐름 설계도" },
              artifacts.B.B2 && { mode: "BLUEPRINTS", label: "3단계: 조사 운영 명세" },
            ]
              .filter(Boolean)
              .map(({ mode, label }: any) => {
                const active = viewMode === mode;
                const isBlueprints = mode === "BLUEPRINTS";

                return (
                  <div key={mode}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                        fontSize: 13,
                        color: selectedBookId ? "#111827" : "#9ca3af",
                        cursor: selectedBookId ? "pointer" : "not-allowed",
                      }}
                    >
                      <input
                        type="radio"
                        name="viewMode"
                        value={mode}
                        disabled={!selectedBookId}
                        checked={active}
                        onChange={() => {
                          setViewMode(mode);

                          if (mode !== "BLUEPRINTS") {
                            setSelectedBlueprintBlockId(null);
                          }
                        }}
                      />
                      {label}
                    </label>

                    {/* BLUEPRINTS 하위 블록 */}
                    {isBlueprints && active && blueprintBlocks.length > 0 && (
                      <div style={inlineListStyle}>
                        {blueprintBlocks.map((b) => {
                          const active = selectedBlueprintBlockId === b.block_id;

                          return (
                            <div
                              key={b.block_id}
                              onClick={() => setSelectedBlueprintBlockId(b.block_id)}
                              style={{
                                fontSize: 13,
                                padding: "4px 6px",
                                borderRadius: 4,
                                cursor: "pointer",
                                color: active ? "#111827" : "#6b7280",
                                background: active ? "#f3f4f6" : "transparent",
                              }}
                            >
                              {b.block_id}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          </SidebarSection>
        )}

        {/* =========================
            C: Typology / Risk
          ========================= */}
        {artifacts?.C && (
          <SidebarSection>
            <div>
              {/* 상위 라디오 */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "#111827",
                  cursor: "pointer",
                  marginBottom: 4,
                }}
              >
                <input
                  type="radio"
                  name="viewMode"
                  value="RISK_TYPES"
                  checked={viewMode === "RISK_TYPES"}
                  onChange={() => {
                    setViewMode("RISK_TYPES");
                  }}
                />
                리스크 유형 분석
              </label>

              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginLeft: 22,
                  marginBottom: 8,
                }}
              >
                범죄 구조 · 반복 패턴 · 탐지 신호
              </div>

              {/* 🔽 하위 Typology ID 리스트 (B와 동일한 패턴) */}
              {viewMode === "RISK_TYPES" && riskTypologies.length > 0 && (
                <div style={inlineListStyle}>
                  {riskTypologies.map((t) => {
                    const active = selectedRiskTypologyId === t.id;

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedRiskTypologyId(t.id)}
                        style={{
                          fontSize: 13,
                          padding: "4px 6px",
                          borderRadius: 4,
                          cursor: "pointer",
                          color: active ? "#111827" : "#6b7280",
                          background: active ? "#f3f4f6" : "transparent",
                        }}
                      >
                        {t.id}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </SidebarSection>
        )}


        {/* =========================
            D: 평가 / 성숙도
          ========================= */}
        {artifacts?.D && (
          <SidebarSection>
            <div>
              {/* JU: 판단 구조 로드맵 */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "#111827",
                  cursor: "pointer",
                  marginBottom: 6,
                }}
              >
                <input
                  type="radio"
                  name="viewMode"
                  value="JU"
                  checked={viewMode === "JU"}
                  onChange={() => {
                    setViewMode("JU");
                  }}
                />
                판단 구조 로드맵
              </label>

              {/* 설명 */}
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginLeft: 22,
                  marginBottom: 10,
                }}
              >
                판단 기준 전체 구조 · 로드맵
              </div>

              {/* MJU: 개별 판단 블록 상세 */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "#111827",
                  cursor: "pointer",
                  marginBottom: 4,
                }}
              >
                <input
                  type="radio"
                  name="viewMode"
                  value="MJU"
                  checked={viewMode === "MJU"}
                  onChange={() => {
                    setViewMode("MJU");
                  }}
                />
                개별 판단 블록
              </label>

              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginLeft: 22,
                  marginBottom: 8,
                }}
              >
                선택한 판단 기준 상세
              </div>

              {/* block_id 리스트 → MJU */}
              {mjuBlocks.length > 0 && (
                <div style={inlineListStyle}>
                  {mjuBlocks.map((b) => {
                    const active = selectedJudgeId === b.block_id;

                    return (
                      <div
                        key={b.block_id}
                        onClick={() => {
                          setSelectedJudgeId(b.block_id);
                          setViewMode("MJU"); // 🔥 핵심
                        }}
                        style={{
                          fontSize: 13,
                          padding: "4px 6px",
                          borderRadius: 4,
                          cursor: "pointer",
                          color: active ? "#111827" : "#6b7280",
                          background: active ? "#f3f4f6" : "transparent",
                        }}
                      >
                        {b.block_id}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </SidebarSection>
        )}

        
        {/* =========================
            공통: 원문 읽기
          ========================= */}
        {selectedBookId && (
          <div style={{ marginTop: 16, paddingTop: 8, borderTop: "1px solid #e5e7eb" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "#111827",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="viewMode"
                value="BRIEFS"
                checked={viewMode === "BRIEFS"}
                onChange={() => {
                  setViewMode("BRIEFS");

                  // 🔄 다른 하위 선택 초기화
                  setSelectedSummaryBlockId(null);
                  setSelectedBlueprintBlockId(null);
                  setBriefPage(1);
                }}
              />
              원문 읽기
            </label>
            
            {/* 사이드바 하단 고정 영역 */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                paddingTop: 12,
                marginTop: 24,
                background: "#fafafa",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                onClick={() => setSidebarOpen(false)}
                style={styles.closeButton}
              >
                사이드바 닫기
              </button>
            </div>

          </div>
        )}

      </div>


    </aside>
  );
}


function SidebarSection({
  children,
  withDivider = true,
}: {
  children: React.ReactNode;
  withDivider?: boolean;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        paddingTop: withDivider ? 12 : 0,
        borderTop: withDivider ? "1px solid #e5e7eb" : "none",
      }}
    >
      {children}
    </div>
  );
}

const inlineListStyle: React.CSSProperties = {
  marginLeft: 22,
  maxHeight: 180,        // ← 이 값만 취향/UX에 맞게 조절
  overflowY: "auto",
  paddingRight: 4,      // 스크롤바 때문에 텍스트 잘림 방지
};

const styles: Record<string, React.CSSProperties> = {
  closeButton: {
    marginTop: 10,
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
}
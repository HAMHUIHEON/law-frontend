// law-frontend/app/strategy/page.tsx

"use client";

import { useStrategyUI } from "./StrategyUIContext";
import { HeadRootView } from "./Head/HeadRootView";
import { ExecDigestView } from "./Exec/ExecDigestView";
import { SummaryView } from "./Summary/SummaryView";
import { BriefSourceView} from "./Brief/BriefSourceView";
import { BApplicationMapView } from "./B_APP_MAP/BApplicationMapView";
import { BBlueprintView } from "./B_BluePrint/BBlueprintView";
import {BFlowView} from "./B_Flow/BFlowView";
import { RiskTypesView } from "./C_RISK/RiskTypeView";
import { JuBlocksView } from "./D_TPG2022/JuBlocksView";
import { MjuRoadmapView } from "./D_TPG2022/MjuRoadmapView";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRecordRecentThought } from "@/app/hooks/useRecordRecentThought";
import { ChapterOneStep1Container } from "./E_STEP1/chapter1/containers/ChapterOneStep1Container";
import { MainLoginRequiredNotice } from "@/app/components/MainLoginRequiredNotice";
import { ChapterTwoStep1Container } from "./E_STEP1/chapter2/ChapterTwoStep1Container";
import { ChapterThreeStep1Container } from "./E_STEP1/chapter3/containers/ChapterThreeStep1Container";

export default function StrategyPage() {
  
  const {
    selectedBookId,
    viewMode,
    selectedEChapter,
    selectedESectionSlug,
  } = useStrategyUI();

  const [showFloatingTop, setShowFloatingTop] = useState(false);
  
  const { userId } = useAuth();
  const [showHint, setShowHint] = useState(false);
  
  const strategyTargetId =
    selectedBookId && viewMode
      ? viewMode === "E_STEP1" && selectedEChapter
        ? `${selectedBookId}:E_STEP1:${selectedEChapter}`
        : viewMode === "E_STEP2" && selectedEChapter && selectedESectionSlug
        ? `${selectedBookId}:E_STEP2:${selectedEChapter}:${selectedESectionSlug}`
        : `${selectedBookId}:${viewMode}`
      : null;

  useRecordRecentThought({
    userId,
    targetType: "strategy",
    targetId: strategyTargetId,
  });


  useEffect(() => {
    const onScroll = () => {
      setShowFloatingTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  

if (!selectedBookId || !viewMode) {
  return (
    <div
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "96px 32px",
      }}
    >
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: "48px 48px 40px",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            marginBottom: 12,
            color: "#111827",
          }}
        >
          Strategy
        </h2>

        <p
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: "#4b5563",
            marginBottom: 28,
          }}
        >
          이 전략 영역은 OECD 가이드라인·국세청 행정규칙를 단순히 읽는 데서 끝내지 않고,  
          <br />
          <strong style={{ color: "#111827" }}>
            이해 → 실행 → 위험 인식 → 판단
          </strong>
          으로 이어지는 실무 의사결정 흐름을 지원합니다.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            rowGap: 12,
            marginBottom: 32,
            fontSize: 14,
            color: "#374151",
          }}
        >
          <div>• 이 문서를 <strong>왜</strong> 읽어야 하는지, 어떤 관점이 필요한지 정리합니다.</div>
          <div>• 실무에서 <strong>어디서부터</strong> 어떻게 움직일지 흐름과 기준을 제공합니다.</div>
          <div>• 반복되는 <strong>리스크 유형과 주의 지점</strong>을 미리 인식할 수 있게 합니다.</div>
          <div>• 개별 사안을 구조적으로 해석하고 <strong>판단</strong>에 이르는 틀을 제공합니다.</div>
        </div>

        <div
          style={{
            paddingTop: 16,
            borderTop: "1px dashed #e5e7eb",
            fontSize: 13,
            color: "#6b7280",
          }}
        >
          ← 왼쪽에서 <strong>간행물</strong>과 <strong>보기 방식</strong>을 선택하면  
          해당 문서를 전략적으로 해석·활용할 수 있는 화면이 열립니다.
        </div>
      </div>
    </div>
  );
}

if (!userId) {
  return (
    <div
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "96px 32px",
      }}
    >
      <MainLoginRequiredNotice />
    </div>
  );
}
  

  return (
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "24px 48px 48px",
        }}
      >
    <div style={{ padding: "24px 48px 48px" }}>
      {viewMode === "HEAD" && (
        <HeadRootView bookId={selectedBookId} />
      )}
      {viewMode === "DIGEST" && (
        <ExecDigestView bookId={selectedBookId} />
      )}
      {viewMode === "SUMMARY" && ( 
      <SummaryView bookId={selectedBookId} />
      )}

      {viewMode === "BRIEFS" && (
        <BriefSourceView bookId={selectedBookId} />
      )}
      
      {viewMode === "FLOW" && (
        <BFlowView bookId={selectedBookId} />
      )}

      {viewMode === "BLUEPRINTS" && (
        <BBlueprintView bookId={selectedBookId} />
      )}

      {viewMode === "APP_MAP" && (
        <BApplicationMapView bookId={selectedBookId} />
      )}
      {viewMode === "RISK_TYPES" && (
        <RiskTypesView bookId={selectedBookId} />
      )}
      {viewMode === "MJU" && (
        <JuBlocksView bookId={selectedBookId} />
      )}
      {viewMode === "JU" && (
        <MjuRoadmapView bookId={selectedBookId} />
      )}

    {viewMode === "E_STEP1" && (
      <>
        {selectedEChapter === "chapter1" && (
          <ChapterOneStep1Container bookId={selectedBookId} />
        )}
        {selectedEChapter === "chapter2" && (
          <ChapterTwoStep1Container bookId={selectedBookId} />
        )}
        {selectedEChapter === "chapter3" && (
          <ChapterThreeStep1Container bookId={selectedBookId} />
        )}
      </>
    )}


    <button
    onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }}
      style={{
      width: "100%",
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      background: "#ebecec",          // ← pure white 제거
      fontSize: 14,
      color: "#374151",
      cursor: "pointer",
      transition: "all 120ms ease",
    }}
        onMouseEnter={(e) => {
      e.currentTarget.style.background = "#f3f4f6";
      e.currentTarget.style.borderColor = "#d1d5db";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "#fafafa";
      e.currentTarget.style.borderColor = "#e5e7eb";
    }}
     >
    ⬆︎ 위로 이동
  </button>
    </div>
{showFloatingTop && (
  <div
    onClick={() =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    style={{
      position: "fixed",
      right: 24,
      bottom: 96, // ← 기존 맨 아래 버튼과 안 겹치게
      zIndex: 50,

      padding: "8px 10px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      fontSize: 12,
      color: "#6b7280",
      cursor: "pointer",

      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
      transition: "all 120ms ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = "#111827";
      e.currentTarget.style.borderColor = "#111827";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "#6b7280";
      e.currentTarget.style.borderColor = "#e5e7eb";
    }}
  >
    ⬆︎ 위로
  </div>
)}
    </div>
  );
}

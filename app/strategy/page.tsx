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


export default function StrategyPage() {
  
  const { selectedBookId, viewMode } = useStrategyUI();
  const [showFloatingTop, setShowFloatingTop] = useState(false);
  
  const { userId } = useAuth();
  const [showHint, setShowHint] = useState(false);

  useRecordRecentThought({
    userId,
    targetType: "strategy",
    targetId:
      selectedBookId && viewMode
        ? `${selectedBookId}:${viewMode}`
        : null,
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
        maxWidth: 880,
        margin: "0 auto",
        padding: "80px 48px",
        color: "#374151",
        lineHeight: 1.7,
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          marginBottom: 16,
          color: "#111827",
        }}
      >
        전략(Strategy)
      </h2>

      <p style={{ marginBottom: 20, color: "#4b5563" }}>
        이 전략 영역은 OECD 가이드라인·보고서를 단순히 읽는 데서 끝내지 않고,  
        <br />
        <strong>이해 → 실행 → 위험 인식 → 판단</strong>으로 이어지는  
        실무 의사결정 흐름을 구조적으로 지원하는 공간입니다.
      </p>

      <ul
        style={{
          paddingLeft: 20,
          marginBottom: 24,
          color: "#374151",
        }}
      >
        <li>· 이 문서를 왜 봐야 하는지, 어떤 관점으로 읽어야 하는지 정리합니다.</li>
        <li>· 실무에서 어디서부터 어떻게 움직일지 흐름과 기준을 제공합니다.</li>
        <li>· 반복되는 리스크 유형과 주의 지점을 미리 인식할 수 있게 합니다.</li>
        <li>· 개별 사안을 어떻게 해석하고 결론에 이르는지 판단의 틀을 제공합니다.</li>
      </ul>

      <p style={{ color: "#6b7280", fontSize: 14 }}>
        ← 왼쪽에서 <strong>간행물</strong>과 <strong>보기 방식</strong>을 선택하면  
        해당 문서를 전략적으로 해석·활용할 수 있는 화면이 열립니다.
      </p>
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

    <button
    onClick={() => {
      document
        .querySelector("aside")
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

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
      <div style={{ padding: "64px", color: "#6b7280" }}>
        왼쪽에서 간행물과 보기 방식을 선택하세요.
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

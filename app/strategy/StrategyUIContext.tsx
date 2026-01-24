// law-frontend/app/strategy/StrategyUIContext.tsx

"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type StrategyViewMode =
  | "HOME"
  | "HEAD"
  | "DIGEST"
  | "SUMMARY"
  | "BRIEFS"
  | "APP_MAP"
  | "FLOW"        
  | "BLUEPRINTS"
  | "RISK_TYPES"
  | "JU"
  | "MJU";
  

type StrategyUIState = {

  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  selectedBookId: string | null;
  setSelectedBookId: (v: string | null) => void;

  viewMode: StrategyViewMode | null;
  setViewMode: (v: StrategyViewMode | null) => void;

  // A
  selectedSummaryBlockId: string | null;
  setSelectedSummaryBlockId: (v: string | null) => void;
  
  // B
  selectedBlueprintBlockId: string | null;           // ⭐
  setSelectedBlueprintBlockId: (id: string | null) => void; // ⭐
  

  // C ✅ 추가
  selectedRiskTypologyId: string | null;
  setSelectedRiskTypologyId: (id: string | null) => void;

  // D ✅ 추가
  selectedJudgeId: string | null;
  setSelectedJudgeId: (id: string | null) => void;


  briefPage: number | null;
  setBriefPage: (v: number | null) => void;
  

};

const StrategyUIContext = createContext<StrategyUIState | null>(null);


export function StrategyUIProvider({ children }: { children: React.ReactNode }) {
  /* ---------- Layout ---------- */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<StrategyViewMode | null>(null);
  const [briefPage, setBriefPage] = useState<number | null>(null);
  const [selectedSummaryBlockId, setSelectedSummaryBlockId] =
    useState<string | null>(null);
  const [selectedBlueprintBlockId, setSelectedBlueprintBlockId] =
    useState<string | null>(null);
  const [selectedRiskTypologyId, setSelectedRiskTypologyId] =
    useState<string | null>(null);

  const [selectedJudgeId, setSelectedJudgeId] =
    useState<string | null>(null);

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,

      selectedBookId,
      setSelectedBookId,
      viewMode,
      setViewMode,
      selectedSummaryBlockId,
      setSelectedSummaryBlockId,
      briefPage,
      setBriefPage,

      selectedRiskTypologyId,
      setSelectedRiskTypologyId,
      selectedBlueprintBlockId, 
      setSelectedBlueprintBlockId,
      selectedJudgeId, 
      setSelectedJudgeId
      
    }),
    [sidebarOpen,selectedBookId, viewMode, briefPage,selectedSummaryBlockId, 
    selectedRiskTypologyId, selectedBlueprintBlockId, selectedJudgeId]
  );

  return (
    <StrategyUIContext.Provider value={value}>
      {children}
    </StrategyUIContext.Provider>
  );
}


export function useStrategyUI() {
  const ctx = useContext(StrategyUIContext);
  if (!ctx) {
    throw new Error("useStrategyUI must be used within StrategyUIProvider");
  }
  return ctx;
}

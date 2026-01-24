// law-frontend/app/cases/CaseUIContext.tsx
"use client";

import React, { createContext, useContext, useMemo, useState , useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRecordRecentThought } from "@/app/hooks/useRecordRecentThought";


export type CaseViewMode = "HOME" | "FLOW" | "STRUCTURE" | "PRACTICE";
export type MainErrorType = "PDF_UNREADABLE" | null ;

type CaseUIState = {
  // data
  caseId: string | null;
  setCaseId: (v: string | null) => void;
  // view
  viewMode: CaseViewMode;

  // ✅ 새 사건 세션(강제 재마운트용)
  sessionKey: number;
  // setters
  setViewMode: (m: CaseViewMode) => void;

  // sidebar (Law 패턴)
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;

  // ✅ 추가
  mainError: string | null;
  setMainError: (v: string | null) => void;
  
  // ✅ “세션 제어” 공용 API
  startCase: (nextCaseId: string) => void;
  resetCase: () => void;
};

const CaseUIContext = createContext<CaseUIState | null>(null);

export function CaseUIProvider({
  children,
  initialCaseId,
}: {
  children: React.ReactNode;
  initialCaseId: string | null;
}) {
  // ✅ 기존 유지
  const [caseId, setCaseId] = useState<string | null>(initialCaseId);
  const [viewMode, setViewMode] = useState<CaseViewMode>("HOME");

  // ✅ Law 레이어 방식 추가
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mainError, setMainError] = useState<string | null>(null);

  // ✅ 세션 키: 사건이 바뀌면 증가 → 하위 컴포넌트 key로 재마운트
  const [sessionKey, setSessionKey] = useState<number>(0);

  const { userId } = useAuth();

  // ✅ 여기서만 Hook 호출
  useRecordRecentThought({
    userId,
    targetType: "case",
    targetId: caseId ?? "",
  });

  const startCase = useCallback((nextCaseId: string) => {
    setMainError(null);
    setViewMode("FLOW");
    setCaseId(nextCaseId);
    setSessionKey((k) => k + 1);
  }, []);

  const resetCase = useCallback(() => {
    setMainError(null);
    setViewMode("HOME");
    setCaseId(null);
    setSessionKey((k) => k + 1);
  }, []);

  
  const value = useMemo<CaseUIState>(() => {
    return {
      caseId,
      setCaseId,
      sessionKey,

      viewMode,
      setViewMode,

      sidebarOpen,
      setSidebarOpen,
      toggleSidebar: () => setSidebarOpen((v) => !v),
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),

      // ✅ 추가
      mainError,
      setMainError,
      
      // ✅ 세션 제어 API
      startCase,
      resetCase,
    };
  }, [caseId, viewMode, sessionKey, sidebarOpen, mainError, startCase, resetCase]);

  return <CaseUIContext.Provider value={value}>{children}</CaseUIContext.Provider>;
}

export function useCaseUI() {
  const ctx = useContext(CaseUIContext);
  if (!ctx) {
    throw new Error("useCaseUI must be used within CaseUIProvider");
  }
  return ctx;
}

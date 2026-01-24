// law-frontend/app/law/LawUIContext.tsx
"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

export type GraphMode =
  | "FLOW"
  | "STRUCTURE"
  | "SEMANTIC"
  | "REASONING"
  | "ARTICLE" 

export type ViewOptions = {
  showFlow: boolean; // 사고 흐름
  showArticle: boolean; // 판단 ↔ 조문
};

export type Snapshot = {
  set_key: string;
  valid_from?: string;
  valid_to?: string;
  promulgated_at?: string;
  effective_at?: string;
};


export type Chapter = {
  chapter_id: string;
  title?: string;
};

export type SelectedArticleRef = {
  scope: "LAW" | "DECREE" | "RULE";
  law_name: string;       // 실제 로우 파일의 law_name (예: 국제조세조정에관한법률 등)
  version_key: string;    // 20230718_19563 같은
  article_id: string;     // ART_65, ART_65_2 등
  title?: string;
};

type Ctx = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  // “통합 set” 선택
  snapshot: Snapshot | null;
  setSnapshot: (s: Snapshot | null) => void;

  // 챕터 목록/선택
  chapters: Chapter[];
  setChapters: (c: Chapter[]) => void;
  currentChapter: string | null;
  setCurrentChapter: Dispatch<SetStateAction<string | null>>;


  // 보기옵션(체크박스)
  viewOptions: ViewOptions;
  setViewOptions: (v: ViewOptions) => void;

  // 그래프 종류(3번째 임무 뼈대)
  graphMode: GraphMode;
  setGraphMode: (m: GraphMode) => void;

  // ✅ 여기 추가
  selectedIssueId: string | null;
  setSelectedIssueId: (v: string | null) => void;

  // 특정 시점(입력값만 일단 보관)
  asOfDate: string;
  setAsOfDate: (v: string) => void;

  articleQuery: string;
  setArticleQuery: (v: string) => void;

  selectedArticleRef: SelectedArticleRef | null;
  setSelectedArticleRef: (v: SelectedArticleRef | null) => void;

  // 🔹 조문 뷰 모드
  articleViewMode: "READ" | "REVERSE";
  setArticleViewMode: (v: "READ" | "REVERSE") => void;
};

const LawUIContext = createContext<Ctx | null>(null);

export function LawUIProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);

  // ✅ 기본값: 사고흐름 + 판단↔조문 둘 다 ON (너가 요구한 기본 셋)
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showFlow: true,
    showArticle: true,
  });

  const [graphMode, setGraphMode] = useState<GraphMode>(() => "STRUCTURE");

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [asOfDate, setAsOfDate] = useState("");
  const [articleQuery, setArticleQuery] = useState("");
  const [selectedArticleRef, setSelectedArticleRef] =
    useState<SelectedArticleRef | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [articleViewMode, setArticleViewMode] =
    useState<"READ" | "REVERSE">("READ");

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,

      snapshot,
      setSnapshot,

      chapters,
      setChapters,
      currentChapter,
      setCurrentChapter,

      viewOptions,
      setViewOptions,

      graphMode,
      setGraphMode,

      // ✅ 여기
      selectedIssueId,
      setSelectedIssueId,

      // ✅ 조문 관련
      selectedArticleId,
      setSelectedArticleId,
      articleViewMode,
      setArticleViewMode,
      articleQuery,
      setArticleQuery,
      selectedArticleRef,
      setSelectedArticleRef,


      asOfDate,
      setAsOfDate,
    }),
    [
      sidebarOpen,
      snapshot,
      chapters,
      currentChapter,
      viewOptions,
      graphMode,
      selectedIssueId,
      selectedArticleId,
      articleQuery,          // ✅ 추가
      selectedArticleRef,    // ✅ 추가
      articleViewMode,
      asOfDate,
    ]
  );
  // LawUIProvider 내부
    useEffect(() => {
      const cleaned = asOfDate.trim().replace(/[^0-9]/g, "");

      // 입력 중이면 아무 것도 하지 않음
      if (cleaned.length !== 0 && cleaned.length !== 6 && cleaned.length !== 8) {
        return;
      }

      const fetchSnapshot = async () => {
        try {
          const url =
            cleaned.length === 0
              ? "http://127.0.0.1:8000/api/law/snapshot/by-date"
              : `http://127.0.0.1:8000/api/law/snapshot/by-date?as_of=${cleaned}`;

          const res = await fetch(url);
          const data = await res.json();

          console.log("SNAPSHOT FETCH", { cleaned, data });

        if (data?.set_key) {
          setSnapshot(data);
        } else {
          console.warn("snapshot not found", cleaned);
          // ✅ 여기서 setSnapshot(null) 하지 마
        }
        } catch (e) {
          console.error("snapshot fetch failed", e);
          setSnapshot(null);
        }
      };

      fetchSnapshot();
    }, [asOfDate]); // ✅ 의존성은 이것 하나만


function normalizeChapterList(raw: any): Chapter[] {
  if (Array.isArray(raw)) return raw as Chapter[];
  if (Array.isArray(raw?.chapters)) return raw.chapters as Chapter[];
  if (Array.isArray(raw?.data)) return raw.data as Chapter[];
  return [];
}
useEffect(() => {
  if (!snapshot?.set_key) return;

  const controller = new AbortController();

  const run = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/law/chapters?set_key=${encodeURIComponent(snapshot.set_key)}`,
        { signal: controller.signal }
      );
      const raw = await res.json();
      const list = normalizeChapterList(raw);

      setChapters(list);

      // ✅ 기존 선택 챕터가 새 목록에 있으면 유지, 없으면 1번으로 교체
      setCurrentChapter((prev) => {
        if (prev && list.some((c) => c.chapter_id === prev)) return prev;
        return list.length > 0 ? list[0].chapter_id : null;
      });
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("chapters fetch failed", e);
      setChapters([]);
      setCurrentChapter(null);
    }
  };

  run();
  return () => controller.abort();
}, [snapshot?.set_key]);

  return <LawUIContext.Provider value={value}>{children}</LawUIContext.Provider>;
}

export function useLawUI() {
  const ctx = useContext(LawUIContext);
  if (!ctx) throw new Error("useLawUI must be used within LawUIProvider");
  return ctx;
}

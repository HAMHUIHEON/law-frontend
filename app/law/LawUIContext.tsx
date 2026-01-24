// law-frontend/app/law/LawUIContext.tsx
"use client";

/**
 * LawUIContext
 *
 * - law 도메인 전체에서 공유되는 UI 상태 저장소
 * - snapshot(set_key)을 기준으로 모든 law feature가 동작
 * - graphMode는 라우팅을 대체하는 핵심 상태
 *
 * ⚠️ 주의
 * - feature 단위로 분리 금지
 * - 이 파일은 "law UI 헌법" 역할
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRecordRecentThought } from "@/app/hooks/useRecordRecentThought";

/* ======================================================
 * Types
 * ====================================================== */

/** 그래프 표시 모드 */
export type GraphMode =
  | "FLOW"
  | "STRUCTURE"
  | "SEMANTIC"
  | "REASONING"
  | "ARTICLE";

/** Sidebar 보기 옵션 */
export type ViewOptions = {
  showFlow: boolean;     // 사고 흐름
  showArticle: boolean;  // 근거 조문
};

/** 법령 스냅샷 (LAW + DECREE + RULE 묶음) */
export type Snapshot = {
  set_key: string;
  valid_from?: string;
  valid_to?: string;
  promulgated_at?: string;
  effective_at?: string;
};

/** 챕터 정보 */
export type Chapter = {
  chapter_id: string;
  title?: string;
};

/** 선택된 조문 참조 */
export type SelectedArticleRef = {
  scope: "LAW" | "DECREE" | "RULE";
  law_name: string;
  version_key: string;
  article_id: string;
  title?: string;
};

/* ======================================================
 * Context Shape
 * ====================================================== */

type LawUIContextValue = {
  /* ---------- Layout ---------- */
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  /* ---------- Snapshot ---------- */
  snapshot: Snapshot | null;
  setSnapshot: (s: Snapshot | null) => void;

  /* ---------- Chapter ---------- */
  chapters: Chapter[];
  setChapters: (c: Chapter[]) => void;
  currentChapter: string | null;
  setCurrentChapter: Dispatch<SetStateAction<string | null>>;

  /* ---------- View Options ---------- */
  viewOptions: ViewOptions;
  setViewOptions: (v: ViewOptions) => void;

  /* ---------- Graph Mode ---------- */
  graphMode: GraphMode;
  setGraphMode: (m: GraphMode) => void;

  /* ---------- Issue Selection ---------- */
  selectedIssueId: string | null;
  setSelectedIssueId: (v: string | null) => void;

  /* ---------- Date Filter ---------- */
  asOfDate: string;
  setAsOfDate: (v: string) => void;

  /* ---------- Article ---------- */
  articleQuery: string;
  setArticleQuery: (v: string) => void;
  selectedArticleRef: SelectedArticleRef | null;
  setSelectedArticleRef: (v: SelectedArticleRef | null) => void;

  articleViewMode: "READ" | "REVERSE";
  setArticleViewMode: (v: "READ" | "REVERSE") => void;
};

const LawUIContext = createContext<LawUIContextValue | null>(null);

/* ======================================================
 * Provider
 * ====================================================== */

export function LawUIProvider({ children }: { children: React.ReactNode }) {
  /* ---------- Layout ---------- */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ---------- Snapshot ---------- */
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  /* ---------- Chapter ---------- */
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);

  /* ---------- View Options ---------- */
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showFlow: true,
    showArticle: true,
  });

  /* ---------- Graph ---------- */
  const [graphMode, setGraphMode] = useState<GraphMode>("STRUCTURE");

  /* ---------- Issue ---------- */
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  /* ---------- Date ---------- */
  const [asOfDate, setAsOfDate] = useState("");

  /* ---------- Article ---------- */
  const [articleQuery, setArticleQuery] = useState("");
  const [selectedArticleRef, setSelectedArticleRef] =
    useState<SelectedArticleRef | null>(null);
  const [articleViewMode, setArticleViewMode] =
    useState<"READ" | "REVERSE">("READ");


  const { userId } = useAuth();
 
  /* ======================================================
   * Effects
   * ====================================================== */

  /**
   * Snapshot fetch (기준 시점)
   */
  useEffect(() => {
    const cleaned = asOfDate.trim().replace(/[^0-9]/g, "");

    // YYYYMM / YYYYMMDD / empty 만 허용
    if (cleaned && cleaned.length !== 6 && cleaned.length !== 8) return;

    const fetchSnapshot = async () => {
      try {
        const url =
          cleaned.length === 0
            ? "http://127.0.0.1:8000/api/law/snapshot/by-date"
            : `http://127.0.0.1:8000/api/law/snapshot/by-date?as_of=${cleaned}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data?.set_key) {
          setSnapshot(data);
        }
      } catch (e) {
        console.error("snapshot fetch failed", e);
      }
    };

    fetchSnapshot();
  }, [asOfDate]);

  /**
   * Chapter fetch (snapshot 기준)
   */
  useEffect(() => {
    if (!snapshot?.set_key) return;

    const controller = new AbortController();

    const normalizeChapterList = (raw: any): Chapter[] => {
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.chapters)) return raw.chapters;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    };

    const run = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/law/chapters?set_key=${encodeURIComponent(
            snapshot.set_key
          )}`,
          { signal: controller.signal }
        );

        const raw = await res.json();
        const list = normalizeChapterList(raw);

        setChapters(list);

        // 기존 선택 유지 or 첫 챕터 자동 선택
        setCurrentChapter((prev) =>
          prev && list.some((c) => c.chapter_id === prev)
            ? prev
            : list[0]?.chapter_id ?? null
        );
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("chapters fetch failed", e);
          setChapters([]);
          setCurrentChapter(null);
        }
      }
    };

    run();
    return () => controller.abort();
  }, [snapshot?.set_key]);

  /* ======================================================
   * 최근 본 사고
   * ====================================================== */
  useRecordRecentThought({
  userId,
  targetType: "law",
  targetId: currentChapter ?? "",
});

  /* ======================================================
   * Context Value
   * ====================================================== */

  const value = useMemo<LawUIContextValue>(
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

      selectedIssueId,
      setSelectedIssueId,

      asOfDate,
      setAsOfDate,

      articleQuery,
      setArticleQuery,
      selectedArticleRef,
      setSelectedArticleRef,

      articleViewMode,
      setArticleViewMode,
    }),
    [
      sidebarOpen,
      snapshot,
      chapters,
      currentChapter,
      viewOptions,
      graphMode,
      selectedIssueId,
      asOfDate,
      articleQuery,
      selectedArticleRef,
      articleViewMode,
    ]
  );

  return (
    <LawUIContext.Provider value={value}>
      {children}
    </LawUIContext.Provider>
  );
}

/* ======================================================
 * Hook
 * ====================================================== */

export function useLawUI() {
  const ctx = useContext(LawUIContext);
  if (!ctx) {
    throw new Error("useLawUI must be used within LawUIProvider");
  }
  return ctx;
}

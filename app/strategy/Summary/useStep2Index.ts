// law-frontend/app/strategy/Summary/useStep2Index.ts

"use client";

import { useEffect, useState } from "react";

/* ======================================================
 * Types (View 보조용, 최소 단위)
 * ====================================================== */

export type SourceSectionRange = {
  start?: number;
  end?: number;
};

export type PageRange = {
  pageStart: number;
  pageEnd: number;
};

type Step2Index = Record<number, PageRange>;

/* ======================================================
 * Hook
 * ====================================================== */

export function useStep2Index(bookId: string) {
  const [index, setIndex] = useState<Step2Index | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://127.0.0.1:8000/api/publications/a/${bookId}/section`
        );

        const json = await res.json();

        const next: Step2Index = {};

        json.sections?.forEach((s: any) => {
          if (
            typeof s.order === "number" &&
            s.page_range?.page_start &&
            s.page_range?.page_end
          ) {
            next[s.order] = {
              pageStart: s.page_range.page_start,
              pageEnd: s.page_range.page_end,
            };
          }
        });

        if (!cancelled) {
          setIndex(next);
        }
      } catch (e) {
        console.error("Failed to load step2 index", e);
        if (!cancelled) {
          setIndex(null);
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

  return { index, loading };
}

/* ======================================================
 * Helper
 * ====================================================== */

/**
 * source_section_order_range → 실제 원문 page_range 계산
 *
 * 설계 원칙:
 * - 추정 ❌
 * - fallback ❌
 * - 없으면 null
 */
export function resolvePageRange(
  sourceRange: SourceSectionRange,
  index: Step2Index
): PageRange | null {
  if (!sourceRange.start || !sourceRange.end) {
    return null;
  }

  const pages = Object.entries(index)
    .filter(([order]) => {
      const o = Number(order);
      return o >= sourceRange.start! && o <= sourceRange.end!;
    })
    .map(([, range]) => range);

  if (pages.length === 0) {
    return null;
  }

  return {
    pageStart: Math.min(...pages.map((p) => p.pageStart)),
    pageEnd: Math.max(...pages.map((p) => p.pageEnd)),
  };
}

// 29_FINAL/law-frontend/app/strategy/E_STEP2B/containers/ChapterStep2bContainer.tsx
"use client";

import { useEffect, useState } from "react";
import { adaptStep2bChapter } from "../adapters";
import { Step2bChapterAnalysis } from "../types";
import ChapterStep2bView from "../views/ChapterStep2bView";

type Props = {
  bookId: string;
  chapter: "chapter1" | "chapter2" | "chapter3";
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export default function ChapterStep2bContainer({
  bookId,
  chapter,
}: Props) {
  const [data, setData] = useState<Step2bChapterAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 🔥 챕터 바뀌는 순간 기존 데이터 제거
    setData(null);
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE}/api/publications/e/${bookId}/E/${chapter}/step2b`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error(
            `Failed to load Step2b chapter (${res.status})`
          );
        }

        const raw = await res.json();
        const adapted = adaptStep2bChapter(raw, chapter);
        console.log("chapter param:", chapter);
        console.log("raw:", raw);

        setData(adapted);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (bookId && chapter) {
      load();
    }
  }, [bookId, chapter]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "#b91c1c" }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ChapterStep2bView
      data={data}
      bookId={bookId}
      chapter={chapter}
    />
  );
}

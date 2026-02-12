"use client";

import { useEffect, useState } from "react";
import { Chapter2Step1Raw, Chapter2Step1ViewModel } from "./types";
import { adaptChapter2Step1 } from "./adapters";
import { ChapterTwoStep1View } from "./ChapterTwoStep1View";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

type Props = {
  bookId: string;
};

export function ChapterTwoStep1Container({ bookId }: Props) {
  const [data, setData] = useState<Chapter2Step1ViewModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE}/api/publications/e/${bookId}/E/chapter2/step1`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch: ${response.status} ${response.statusText}`
          );
        }

        const raw: Chapter2Step1Raw = await response.json();

        const adapted = adaptChapter2Step1(raw);

        if (isMounted) {
          setData(adapted);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unknown error occurred"
          );
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [bookId]);

  if (loading) {
    return <div style={{ padding: 40 }}>불러오는 중...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 40 }}>
        오류 발생: {error}
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: 40 }}>데이터 없음</div>;
  }

  return (
    <ChapterTwoStep1View
      bookId={bookId}
      data={data}
    />
  );
}

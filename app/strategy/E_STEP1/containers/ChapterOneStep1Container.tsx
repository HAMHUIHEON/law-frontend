"use client";

import { useEffect, useState } from "react";
import { adaptChapterOneStep1 } from "../adapters";
import { RawChapterOneStep1 } from "../types";
import { ChapterOneStep1View } from "../views/ChapterOneStep1View";
import { ChapterOneStep1ViewModel } from "../types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

type Props = {
  bookId: string;
};

export function ChapterOneStep1Container({ bookId }: Props) {
  const [data, setData] = useState<ChapterOneStep1ViewModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/api/publications/e/${bookId}/E/chapter1/step1`
      );

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const raw: RawChapterOneStep1 = await res.json();
      const adapted = adaptChapterOneStep1(raw);

      setData(adapted);
      setLoading(false);
    };

    run();
  }, [bookId]);

  if (loading) {
    return <div style={{ padding: 40 }}>불러오는 중...</div>;
  }

  if (!data) {
    return <div style={{ padding: 40 }}>데이터 없음</div>;
  }

  return <ChapterOneStep1View data={data} />;
}

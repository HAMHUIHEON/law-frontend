//E_STEP2/containers/SectionStep2Container.tsx
"use client";

import { useEffect, useState } from "react";
import { adaptStep2Section } from "../adapters";
import { Step2SectionViewModel } from "../types";
import SectionStep2View from "../views/SectionStep2View";

type Props = {
  bookId: string;
  chapter: "chapter1" | "chapter2" | "chapter3";
  sectionSlug: string | null;
};

export default function SectionStep2Container({
  bookId,
  chapter,
  sectionSlug,
}: Props) {
  const [data, setData] = useState<Step2SectionViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sectionSlug) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/${bookId}/E/${chapter}/step2/sections/${sectionSlug}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Failed to load Step2 section");
        }

        const raw = await res.json();
        const adapted = adaptStep2Section(raw);

        setData(adapted);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookId, chapter, sectionSlug]);

  if (!sectionSlug) {
    return null;
  }

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

if (!data || !sectionSlug) {
  return null;
}

return (
  <SectionStep2View
    data={data}
    bookId={bookId}
    chapter={chapter}
    sectionSlug={sectionSlug}
  />
);
}

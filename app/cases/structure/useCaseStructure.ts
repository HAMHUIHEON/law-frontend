// app/cases/structure/useCaseStructure.ts
import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export function useCaseStructure(caseId: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!caseId) {
      setData(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`${API_BASE}/api/cases/${caseId}/report-b`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setData(null);
        setLoading(false);
      });

    return () => controller.abort();
  }, [caseId]);

  return { data, loading };
}

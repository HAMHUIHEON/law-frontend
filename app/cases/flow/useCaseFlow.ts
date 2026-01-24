// app/cases/flow/useCaseFlow.ts
import { useEffect, useState } from "react";
import { adaptCaseFlow } from "./adapters";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export function useCaseFlow(caseId: string | null) {
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

    fetch(`${API_BASE}/api/cases/${caseId}/report-a`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((json) => {
        // 🔥 여기 한 줄만 추가
        setData(adaptCaseFlow(json));
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

// app/cases/structure/useCaseStructure.ts
import { useEffect, useState } from "react";
import { useCaseUI } from "../CaseUIContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export function useCaseStructure(caseId: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { setMainError } = useCaseUI(); // ✅ 추가

  useEffect(() => {
    if (!caseId) {
      setData(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setMainError(null);

    fetch(`${API_BASE}/api/cases/${caseId}/report-b`, {
      signal: controller.signal,
    })
      .then((res) => {
        // 🔐 로그인 필요
        if (res.status === 401) {
          setMainError("LOGIN_REQUIRED");
          setLoading(false);
          return null;
        }

        if (!res.ok) {
          throw new Error("fetch failed");
        }

        return res.json();
      })

      .then((json) => {
        if (!json) return; // 401 처리된 경우
        setData(json);
        setLoading(false);
      })

      .catch((err) => {
        if (err?.name === "AbortError") return;
        setData(null);
        setLoading(false);
      });

    return () => controller.abort();
  }, [caseId, setMainError]);

  return { data, loading };
}

// app/cases/flow/useCaseFlow.ts
import { useEffect, useState } from "react";
import { adaptCaseFlow } from "./adapters";
import { useCaseUI } from "../CaseUIContext";
import { useAuth } from "@clerk/nextjs";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export function useCaseFlow(caseId: string | null) {
  const { getToken } = useAuth();
  const { setMainError } = useCaseUI();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!caseId) {
      setData(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setMainError(null);

      // 🔑 1️⃣ 토큰 먼저 받기
      const token = await getToken({ template: "backend-api" });

      // 🔐 로그인 안 된 상태
      if (!token) {
        setMainError("LOGIN_REQUIRED");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_BASE}/api/cases/${caseId}/report-a`,
          {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );

        if (res.status === 401) {
          setMainError("LOGIN_REQUIRED");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error("fetch failed");
        }

        const json = await res.json();
        setData(adaptCaseFlow(json));
        setLoading(false);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setData(null);
        setLoading(false);
      }
    };

    run();

    return () => controller.abort();
  }, [caseId, getToken, setMainError]);

  return { data, loading };
}
// C_RISK/risk.api.ts
import { RiskTypologyResponse } from "./types";

export async function getRiskTypologyRaw(bookId: string): Promise<RiskTypologyResponse> {
  const res = await fetch(
    `http://127.0.0.1:8000/api/publications/c/${encodeURIComponent(bookId)}/typology`
  );

  if (!res.ok) {
    // 서버가 JSON 에러를 줄 수도 있어서 방어적으로 텍스트도 확보
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to fetch risk typology (${res.status}) for book ${bookId}. ${text}`.trim()
    );
  }

  return (await res.json()) as RiskTypologyResponse;
}

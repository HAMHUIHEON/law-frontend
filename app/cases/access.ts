//app/cases/access.ts


import type { UserAccessLevel } from "@/app/types/access";

export type CaseReportType = "A" | "B" | "C";

export type CaseContentAccess =
  | "FULL"
  | "PARTIAL"
  | "LOCKED";

/**
 * 판례 접근 정책 (SSOT)
 */
export function getCaseAccess(
  user: UserAccessLevel,
  report: CaseReportType
): CaseContentAccess {
  // A: 전원 무료
  if (report === "A") return "FULL";

  // B: 구조는 맛보기, 핵심은 구독
  if (report === "B") {
    if (user === "SUBSCRIBER") return "FULL";
    if (user === "MEMBER") return "PARTIAL";
    return "LOCKED";
  }

  // C: 구독자 전용
  if (user === "SUBSCRIBER") return "FULL";
  return "LOCKED";
}

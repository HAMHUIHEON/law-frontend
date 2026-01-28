
//app/law/access.ts

import type { UserAccessLevel } from "@/app/types/access";

export type LawFeature =
  | "SEMANTIC"
  | "REASONING"
  | "ARTICLE";

export type LawContentAccess =
  | "FULL"
  | "LOCKED";

/**
 * 법령 접근 정책 (SSOT)
 */
export function getLawAccess(
  user: UserAccessLevel,
  feature: LawFeature
): LawContentAccess {
  // 로그인만 하면 기본 구조는 보이게
  if (user === "SUBSCRIBER") return "FULL";

  // 비구독자는 전부 잠금 (오늘은 여기까지)
  return "LOCKED";
}

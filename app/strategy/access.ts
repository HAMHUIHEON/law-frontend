// app/strategy/access.ts

import type { UserAccessLevel } from "@/app/types/access";

/**
 * Strategy 화면 모드
 */
export type StrategyViewMode =
  | "HOME"
  | "HEAD"
  | "DIGEST"
  | "SUMMARY"
  | "BRIEFS"
  | "APP_MAP"
  | "FLOW"
  | "BLUEPRINTS"
  | "RISK_TYPES"
  | "JU"
  | "MJU"
  | "E_STEP1"
  | "E_STEP2"
  | "E_STEP2B";   // 🔥 추가
/**
 * 전략 접근 결과
 */
export type StrategyContentAccess =
  | "FULL"
  | "LOCKED";

/**
 * 전략 접근 정책 (SSOT)
 */
export function getStrategyAccess(
  user: UserAccessLevel,
  viewMode: StrategyViewMode
): StrategyContentAccess {
  // ✅ 항상 무료
  const FREE: StrategyViewMode[] = [
    "HOME",
    "HEAD",
    "DIGEST",
    "BRIEFS",
    "APP_MAP",
    "FLOW",
    "JU",
    "E_STEP1",   // 🔥 추가
    "E_STEP2",   // 🔥 추가
    "E_STEP2B",  // 🔥 추가

  ];

  // 🔒 구독자 전용
  const PAID: StrategyViewMode[] = [
    "SUMMARY",
    "BLUEPRINTS",
    "RISK_TYPES",
    "MJU",

  ];

  if (FREE.includes(viewMode)) return "FULL";

  if (PAID.includes(viewMode)) {
    return user === "SUBSCRIBER" ? "FULL" : "LOCKED";
  }

  return "LOCKED";
}

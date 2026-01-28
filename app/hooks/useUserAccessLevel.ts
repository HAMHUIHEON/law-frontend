//app/hooks/useUserAccessLevel.ts

"use client";

import { useAuth } from "@clerk/nextjs";

export type UserAccessLevel = "GUEST" | "MEMBER" | "SUBSCRIBER";

export function useUserAccessLevel(): UserAccessLevel {
  const { userId } = useAuth();

  if (!userId) return "GUEST";

  // 🔥 오늘은 전부 MEMBER로 본다
  return "MEMBER";

  // 나중에:
  // return hasActiveSubscription ? "SUBSCRIBER" : "MEMBER";
}

// app/hooks/useRecordRecentThought.ts
"use client";

import { useEffect } from "react";
import { recordRecentThought, ThoughtTargetType } from "@/app/actions/recordRecentThought";

type Params = {
  userId?: string | null;
  targetType: ThoughtTargetType;
  targetId: string | null;
};

export function useRecordRecentThought({
  userId,
  targetType,
  targetId,
}: Params) {
  useEffect(() => {
    if (!userId || !targetId) return;

    void recordRecentThought({
      userId,
      targetType,
      targetId,
    });
  }, [userId, targetType, targetId]);
}

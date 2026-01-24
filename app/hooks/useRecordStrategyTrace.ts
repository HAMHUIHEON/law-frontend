// app/hooks/useRecordStrategyTrace.ts
"use client";

import { useEffect } from "react";
import { recordThoughtTrace } from "@/app/actions/recordThoughtTrace";

type Params = {
  userId?: string | null;
  parentType: "case" | "law" | "strategy"; // ✅ 추가
  parentId: string;
  traceType: "article" | "semantic" | "reasoning";
  traceId: string | null;
};

export function useRecordStrategyTrace({
  userId,
  parentId,
  traceType,
  parentType,
  traceId,
}: Params) {
  useEffect(() => {
    if (!userId) return;
    if (!parentId) return;
    if (!traceId) return;

    void recordThoughtTrace({
      userId,
      parentType,
      parentId,
      traceType,
      traceId,
    });
  }, [userId, parentId, traceType, traceId, parentType]); // parentType도 의존성 배열에 추가
}

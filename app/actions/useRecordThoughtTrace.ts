// app/actions/useRecordThoughtTrace.ts
"use client";

import { useEffect } from "react";
import {
  recordThoughtTrace,
  TraceParentType,
  TraceType,
} from "./recordThoughtTrace";

export function useRecordThoughtTrace(params: {
  userId?: string | null;
  parentType: TraceParentType;
  parentId: string;
  traceType: TraceType;
  traceId: string;
}) {
  const { userId, parentType, parentId, traceType, traceId } = params;

  useEffect(() => {
    if (!userId) return;
    if (!parentId || !traceId) return;

    void recordThoughtTrace({
      userId,
      parentType,
      parentId,
      traceType,
      traceId,
    });
  }, [userId, parentType, parentId, traceType, traceId]);
}

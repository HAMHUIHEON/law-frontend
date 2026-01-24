// app/hooks/useSaveThought.ts
"use client";

import { useCallback } from "react";
import { recordSavedThought } from "@/app/actions/recordSavedThought";


type ThoughtType =
  | "article"
  | "semantic"
  | "reasoning"
  | "summary"
  | "case"
  | "law"
  | "strategy"
  | "document"
  | "block";

type SaveThoughtParams = {
  targetType: ThoughtType;
  targetId: string;
  parentType: "case" | "law" | "strategy";
  parentId: string;
};

export function useSaveThought(userId?: string | null) {
  return useCallback(
    async (params: SaveThoughtParams) => {
      if (!userId) return;

      await recordSavedThought({
        userId,
        // ⬇️ 여기서만 타입 다운캐스팅
        targetType: params.targetType as any,
        targetId: params.targetId,
        parentType: params.parentType,
        parentId: params.parentId,
      });
    },
    [userId]
  );
}
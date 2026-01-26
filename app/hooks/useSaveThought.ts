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

export function useSaveThought() {
  return useCallback(async (params: SaveThoughtParams) => {
    await recordSavedThought(params);
  }, []);
}

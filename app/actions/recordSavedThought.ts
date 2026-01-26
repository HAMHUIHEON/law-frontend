// app/actions/recordSavedThought.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

export async function recordSavedThought(params: {
  targetType:
    | "article"
    | "semantic"
    | "reasoning"
    | "summary"
    | "case"
    | "law"
    | "strategy"
    | "document"
    | "block";
  targetId: string;

  parentType: "case" | "law" | "strategy";
  parentId: string;
}) {
  const { userId } = await auth(); // ✅ 핵심 수정

  if (!userId) return;

  const { error } = await supabaseAdmin
    .from("saved_thoughts")
    .insert({
      user_id: userId,
      target_type: params.targetType,
      target_id: params.targetId,
      parent_type: params.parentType,
      parent_id: params.parentId,
    })
    .select()
    .single();

  if (error && error.code !== "23505") {
    throw error;
  }
}

// app/actions/recordSavedThought.ts
"use server";

import { supabaseAdmin } from "@/app/lib/supabaseServer";

export async function recordSavedThought(params: {
  userId: string;

  targetType: "case" | "law" | "strategy" | "document" | "block";
  targetId: string;

  parentType: "case" | "law" | "strategy";
  parentId: string;
}) {
  const {
    userId,
    targetType,
    targetId,
    parentType,
    parentId,
  } = params;

  const { error } = await supabaseAdmin
    .from("saved_thoughts")
    .insert({
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
      parent_type: parentType,
      parent_id: parentId,
    })
    .select()
    .single();

  // 🔥 unique index 충돌은 “이미 저장됨”이므로 에러로 안 본다
  if (error && error.code !== "23505") {
    throw error;
  }
}

// app/actions/recordRecentThought.ts
"use server";

import { supabaseAdmin } from "@/app/lib/supabaseServer";

export type ThoughtTargetType =
  | "case"
  | "law"
  | "strategy"
  | "document"
  | "block";

export async function recordRecentThought(params: {
  userId: string;
  targetType: ThoughtTargetType;
  targetId: string;
}) {
  const { userId, targetType, targetId } = params;

  if (!userId || !targetId) return;

  const { error } = await supabaseAdmin
    .from("recent_thoughts")
    .upsert(
      {
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        last_viewed_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,target_type,target_id",
      }
    );

  if (error) {
    console.error("[recordRecentThought]", error);
    throw error;
  }
}

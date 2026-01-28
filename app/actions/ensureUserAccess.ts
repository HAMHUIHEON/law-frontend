//app/actions/ensureUserAccess.ts

"use server";

import { supabaseAdmin } from "@/app/lib/supabaseServer";

export async function ensureUserAccess(userId: string) {
  if (!userId) return;

  await supabaseAdmin
    .from("user_access_levels")
    .upsert(
      {
        user_id: userId,
        access_level: "MEMBER",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
}

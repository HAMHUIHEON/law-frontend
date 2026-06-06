// app/api/me/unsubscribe/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await supabaseAdmin
    .from("user_access_levels")
    .update({
      cancelled_at: new Date().toISOString(),
    })
    .eq("user_id", userId);


  // 2️⃣ 구독 히스토리 종료 처리
  const now = new Date().toISOString();

  const { error: historyErr } = await supabaseAdmin
    .from("user_subscription_history")
    .update({
      ended_at: now,
      ended_reason: "cancelled",
    })
    .eq("user_id", userId)
    .is("ended_at", null); // 🔥 아직 종료 안 된 구독만

  if (historyErr) {
    console.error("[unsubscribe] history update failed:", historyErr);
    return NextResponse.json({ error: "history db error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

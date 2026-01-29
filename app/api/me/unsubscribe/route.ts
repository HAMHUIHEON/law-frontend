// app/api/me/unsubscribe/route.ts

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

  return NextResponse.json({ ok: true });
}

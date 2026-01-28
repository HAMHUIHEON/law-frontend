// app/api/me/subscribe/route.ts
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
    .upsert({
      user_id: userId,
      access_level: "SUBSCRIBER",
      updated_at: new Date().toISOString(),
    });

  return NextResponse.json({ ok: true });
}

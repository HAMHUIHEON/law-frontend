// app/api/me/subscribe/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";
// NOTE:
// 결제 연동 후에는 결제 성공 콜백에서 호출될 예정

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

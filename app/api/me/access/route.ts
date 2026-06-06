// app/api/me/access/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

/**
 * GET /api/me/access
 * returns: { access_level: "GUEST" | "MEMBER" | "SUBSCRIBER" }
 */
export async function GET() {
  const { userId } = await auth();

  // 1️⃣ 비로그인 → GUEST
  if (!userId) {
    return NextResponse.json({ access_level: "GUEST" });
  }

  // 2️⃣ DB 조회
  const { data, error } = await supabaseAdmin
    .from("user_access_levels")
    .select("access_level")
    .eq("user_id", userId)
    .single();

  // 3️⃣ row 없으면 → MEMBER (로그인만 한 상태)
  if (error || !data) {
    return NextResponse.json({ access_level: "MEMBER" });
  }

  // 4️⃣ 정상 반환
  return NextResponse.json({
    access_level: data.access_level,
  });
}

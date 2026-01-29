// app/api/payment/portone/webhook/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

type PortOneWebhookPayload = {
  imp_uid?: string;
  merchant_uid?: string;
  status?: "paid" | "failed" | "cancelled";
};

export async function POST(req: Request) {
  const body = (await req.json()) as PortOneWebhookPayload;

  // ✅ 0) 무조건 원문 로그 (테스트 끝나면 지워도 됨)
  console.log("[portone:webhook] payload:", body);

  const { merchant_uid, status } = body;

  // ✅ 1) paid 아닌 경우 로그만 남기고 종료
  if (status !== "paid") {
    console.log("[portone:webhook] non-paid status:", status);
    return NextResponse.json({ ok: true });
  }

  // ✅ 2) merchant_uid 검증
  if (!merchant_uid) {
    console.error("[portone:webhook] missing merchant_uid");
    return NextResponse.json({ error: "missing merchant_uid" }, { status: 400 });
  }

  const parts = merchant_uid.split("_");
  if (parts.length < 3 || parts[0] !== "subscribe") {
    console.error("[portone:webhook] invalid merchant_uid:", merchant_uid);
    return NextResponse.json({ error: "invalid merchant_uid" }, { status: 400 });
  }

  const userId = parts.slice(1, -1).join("_");
  console.log("[portone:webhook] parsed userId:", userId);

  // ✅ 3) DB 반영 + 에러 체크
  const { error } = await supabaseAdmin
    .from("user_access_levels")
    .upsert({
      user_id: userId,
      access_level: "SUBSCRIBER",
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("[portone:webhook] db error:", error);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

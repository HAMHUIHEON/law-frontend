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

  console.log("[portone:webhook] payload:", body);

  const { merchant_uid, status } = body;

  // 1️⃣ 결제 성공만 처리
  if (status !== "paid") {
    return NextResponse.json({ ok: true });
  }

  if (!merchant_uid) {
    console.error("[portone:webhook] missing merchant_uid");
    return NextResponse.json({ error: "missing merchant_uid" }, { status: 400 });
  }

  // 2-0️⃣ 이미 paid 처리된 주문인지 확인
  const { data: paidOrder } = await supabaseAdmin
    .from("payment_orders")
    .select("status")
    .eq("merchant_uid", merchant_uid)
    .single();

  if (paidOrder?.status === "paid") {
    // 이미 처리된 웹훅 → 그냥 OK
    return NextResponse.json({ ok: true });
  }

  // 2️⃣ 주문 조회 (🔥 파싱 없음)
  const { data: order, error: orderErr } = await supabaseAdmin
    .from("payment_orders")
    .select("user_id")
    .eq("merchant_uid", merchant_uid)
    .single();

  if (orderErr || !order) {
    console.error("[portone:webhook] order not found:", merchant_uid);
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }


  const userId = order.user_id;


  // 3️⃣ 구독 권한 부여 + 종료일 설정 (SSOT)
  const now = new Date();
  const endAt = new Date(now);
  endAt.setMonth(endAt.getMonth() + 1);

  const { error: accessErr } = await supabaseAdmin
    .from("user_access_levels")
    .upsert({
      user_id: userId,
      access_level: "SUBSCRIBER",
      subscription_end_at: endAt.toISOString(), // ⭐ 핵심
      cancelled_at: null,                        // 해지 안 된 상태
      updated_at: now.toISOString(),
    });


  if (accessErr) {
    console.error("[portone:webhook] access update failed:", accessErr);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }

  // 4️⃣ 주문 상태 업데이트 (선택이지만 강력 추천)
  await supabaseAdmin
    .from("payment_orders")
    .update({ status: "paid" })
    .eq("merchant_uid", merchant_uid);

  return NextResponse.json({ ok: true });
}

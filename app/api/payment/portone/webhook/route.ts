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

  // 🔹 현재 시각
  const now = new Date();

  // 🔹 기존 구독 만료일 조회
  const { data: currentAccess } = await supabaseAdmin
    .from("user_access_levels")
    .select("subscription_end_at")
    .eq("user_id", userId)
    .single();

  // 🔹 기준 시점 결정
  // - 남은 구독 기간이 있으면 → 그 끝
  // - 없으면 → 지금
  const baseDate =
    currentAccess?.subscription_end_at &&
    new Date(currentAccess.subscription_end_at) > now
      ? new Date(currentAccess.subscription_end_at)
      : now;

  // 🔹 기준 시점에서 +1개월
  const endAt = new Date(baseDate);
  endAt.setMonth(endAt.getMonth() + 1);

  // 🔹 권한 업서트
  const { error: accessErr } = await supabaseAdmin
    .from("user_access_levels")
    .upsert({
      user_id: userId,
      access_level: "SUBSCRIBER",
      subscription_end_at: endAt.toISOString(),
      cancelled_at: null, // 🔥 재구독 시 해지 상태 초기화
      updated_at: now.toISOString(),
    });


  if (accessErr) {
    console.error("[portone:webhook] access update failed:", accessErr);
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }


  // 3-1️⃣ 구독 히스토리 기록 (덮어쓰지 않고 누적)
  const { error: historyErr } = await supabaseAdmin
    .from("user_subscription_history")
    .insert({
      user_id: userId,
      started_at: baseDate.toISOString(), // 이 구독이 실제로 시작되는 시점
      merchant_uid,
    });

  if (historyErr) {
    console.error("[portone:webhook] history insert failed:", historyErr);
    // 실패해도 결제 자체는 성공했을 수 있으니, 여기서 500으로 막을지 정책 선택.
    // 보통은 막는게 맞음(정합성). 일단 막자:
    return NextResponse.json({ error: "history db error" }, { status: 500 });
  }

  // 4️⃣ 주문 상태 업데이트 (선택이지만 강력 추천)
  await supabaseAdmin
    .from("payment_orders")
    .update({ status: "paid" })
    .eq("merchant_uid", merchant_uid);

  return NextResponse.json({ ok: true });
}

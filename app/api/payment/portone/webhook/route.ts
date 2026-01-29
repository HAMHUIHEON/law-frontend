// app/api/payment/portone/webhook/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

type PortOneWebhookPayload = {
  imp_uid: string;       // PortOne 결제 ID
  merchant_uid: string; // 우리가 생성한 주문 ID
  status: "paid" | "failed" | "cancelled";
};

export async function POST(req: Request) {
  const body = (await req.json()) as PortOneWebhookPayload;

  const { imp_uid, merchant_uid, status } = body;

  // 1️⃣ 결제 실패 / 취소 → 무시
  if (status !== "paid") {
    return NextResponse.json({ ok: true });
  }

  // 2️⃣ merchant_uid 에서 userId 추출
  // 예: subscribe_{userId}_{timestamp}
  const [, userId] = merchant_uid.split("_");

  if (!userId) {
    return NextResponse.json({ error: "invalid merchant_uid" }, { status: 400 });
  }

  // 3️⃣ 결제 성공 → 권한 부여
  await supabaseAdmin
    .from("user_access_levels")
    .upsert({
      user_id: userId,
      access_level: "SUBSCRIBER",
      updated_at: new Date().toISOString(),
    });

  return NextResponse.json({ ok: true });
}

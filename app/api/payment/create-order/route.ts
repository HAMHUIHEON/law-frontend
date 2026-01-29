// app/api/payment/create-order/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

type CreateOrderBody = {
  merchant_uid: string;
};

export async function POST(req: Request) {
  // 1️⃣ 로그인 확인
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
    );
  }

  // 2️⃣ body 파싱
  const body = (await req.json()) as CreateOrderBody;
  const { merchant_uid } = body;

  if (!merchant_uid) {
    return NextResponse.json(
      { error: "missing merchant_uid" },
      { status: 400 }
    );
  }

  // 3️⃣ 주문 생성 (merchant_uid ↔ user_id 매핑)
  const { error } = await supabaseAdmin
    .from("payment_orders")
    .insert({
      merchant_uid,
      user_id: userId,
      status: "pending",
    });

  if (error) {
    console.error("[create-order] db error:", error);
    return NextResponse.json(
      { error: "db error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

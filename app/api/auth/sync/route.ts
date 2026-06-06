// 29_FINAL/law-frontend/app/api/auth/sync/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const primaryEmail = user.emailAddresses.find(
    (e: { id: string; emailAddress: string }) =>
      e.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) {
    return NextResponse.json(
      { error: "No primary email" },
      { status: 400 }
    );
  }

  await supabaseAdmin.from("users").upsert({
    id: userId,
    email: primaryEmail,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

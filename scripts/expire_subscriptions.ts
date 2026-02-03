// scripts/expire_subscriptions.ts
/**
 * ⚠️ 운영 자동 배치 아님
 * - Supabase DB cron이 정기 실행 담당
 * - 이 스크립트는 수동/디버깅용
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const { error } = await supabase.rpc("expire_subscriptions");

  if (error) {
    console.error("❌ expire failed:", error);
    process.exit(1);
  }

  console.log("✅ subscription expiration done");
  process.exit(0);
}

run();

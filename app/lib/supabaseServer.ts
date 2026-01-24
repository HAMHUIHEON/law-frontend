// law-frontend/lib/supabaseServer.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error("SUPABASE_URL is required");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

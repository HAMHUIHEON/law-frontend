// app/actions/recordThoughtTrace.ts
"use server";

import { supabaseAdmin } from "@/app/lib/supabaseServer";

export type TraceParentType = "case" | "law" | "strategy";
export type TraceType = "article" | "semantic" | "reasoning";

export async function recordThoughtTrace(params: {
  userId: string;
  parentType: TraceParentType;
  parentId: string;
  traceType: TraceType;
  traceId: string;
}) {
  const { userId, parentType, parentId, traceType, traceId } = params;

  if (!userId || !parentId || !traceId) return;

  const { error } = await supabaseAdmin.from("thought_traces").insert({
    user_id: userId,
    parent_type: parentType,
    parent_id: parentId,
    trace_type: traceType,
    trace_id: traceId,
    viewed_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[recordThoughtTrace]", error);
    throw error;
  }
}

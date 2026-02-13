// app/cases/flow/page.tsx
"use client";

import { useCaseUI } from "../CaseUIContext";
import { useCaseFlow } from "./useCaseFlow";
import { CaseFlowView } from "./CaseFlowView";

export const dynamic = "force-dynamic";

export default function CaseFlowPage() {
  const { caseId, openSidebar } = useCaseUI();
  const flow = useCaseFlow(caseId);

  if (!caseId) return null;
  if (flow.loading) return <p style={{ padding: 32 }}>불러오는 중…</p>;
  if (!flow.data) return <p style={{ padding: 32 }}>등록되지 않은 판례입니다. 업로드 후 이용해 주세요.</p>;

  return (
    <CaseFlowView
      data={flow.data}
      onOpenMenu={() => {
        openSidebar();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}

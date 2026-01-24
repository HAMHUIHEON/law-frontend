// app/cases/flow/page.tsx
"use client";

import { useCaseUI } from "../CaseUIContext";
import { useCaseFlow } from "./useCaseFlow";
import { CaseFlowView } from "./CaseFlowView";

export default function CaseFlowPage() {
  const { caseId, openSidebar } = useCaseUI();
  const flow = useCaseFlow(caseId);

  if (!caseId) return null;
  if (flow.loading) return <p style={{ padding: 32 }}>불러오는 중…</p>;
  if (!flow.data) return <p style={{ padding: 32 }}>해당 판례를 불러오지 못했어요.</p>;

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

// app/cases/structure/page.tsx
"use client";

import { useCaseUI } from "../CaseUIContext";
import { useCaseStructure } from "./useCaseStructure";
import { adaptCaseStructure } from "./adapters";
import { CaseStructureView } from "./CaseStructureView";

export const dynamic = "force-dynamic";

export default function CaseIssuePage() {
  const { caseId, openSidebar } = useCaseUI();
  const { data, loading } = useCaseStructure(caseId);

  if (!caseId) return null;
  if (loading) return <p style={{ padding: 32 }}>불러오는 중…</p>;
  if (!data) return <p style={{ padding: 32 }}>Report B를 불러오지 못했어요.</p>;

  const vm = adaptCaseStructure(data);

  return (
    <CaseStructureView
      vm={vm}
      onOpenMenu={() => {
        openSidebar();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}

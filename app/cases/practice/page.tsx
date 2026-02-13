// law-frontend/app/cases/practice/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useCaseUI } from "../CaseUIContext";
import { useCasePractice } from "./useCasePractice";
import { adaptCasePractice } from "./adapters";
import { CasePracticeView } from "./CasePracticeView";

export const dynamic = "force-dynamic";

export default function PracticePage() {
  const params = useSearchParams();
  const urlCaseId = params.get("caseId");
  
  const urlIssueParam = params.get("issue");
  const urlIssue = urlIssueParam ?? undefined; // ✅ 핵심
  
  const { caseId, setCaseId, openSidebar } = useCaseUI();

  // ✅ 핵심: URL → Context 동기화
  useEffect(() => {
    if (!urlCaseId) return;
    if (urlCaseId === caseId) return;
    setCaseId(urlCaseId);
  }, [urlCaseId, caseId, setCaseId]);

  const practice = useCasePractice(caseId);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  if (!caseId) return null;
  if (practice.loading) return <p style={{ padding: 32 }}>불러오는 중…</p>;
  if (!practice.data)
    return <p style={{ padding: 32 }}>등록되지 않은 판례입니다. 업로드 후 이용해 주세요.</p>;

  const vm = adaptCasePractice(practice.data);

  return (
        <>
      <CasePracticeView
        vm={vm}
        initialIssue={urlIssue} // ✅ undefined면 첫 issue 자동 선택
        onOpenMenu={() => {
          openSidebar();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onIssueChange={setSelectedIssue}
      />

    </>
  );
}

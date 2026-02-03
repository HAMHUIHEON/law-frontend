// law-frontend/app/cases/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCaseUI } from "./CaseUIContext";
import { MainUploadError } from "./MainUploadError";
import { MainUploadCachedNotice } from "./MainUploadCachedNotice";
import {MainUploadLimitNotice} from "./MainUploadLimitNotice";
import {MainUploadSubscriptionRequiredNotice} from "./MainUploadSubscriptionRequiredNotice";
import {MainLoginRequiredNotice} from "./LoginRequiredNotice";

type MainErrorType =
  | "PDF_UNREADABLE"
  | "CACHE_HIT"
  | "CASE_LIMIT_EXCEEDED"
  | "SUBSCRIPTION_REQUIRED"
  | "LOGIN_REQUIRED"
  | null;

export const dynamic = "force-dynamic";

export default function CasesRootPage() {
  const sp = useSearchParams();
  const { caseId, startCase, mainError } = useCaseUI();
  
  // ✅ URL 쿼리로도 caseId를 받을 수 있게: /cases?case_id=2022구합7106
  const qCaseId = useMemo(() => sp.get("case_id"), [sp]);

  useEffect(() => {
    // URL → Context 동기화 (초기 1회만 유효하게 동작하도록: caseId 없을 때만)
    if (qCaseId && !caseId) {
      startCase(qCaseId);
    }
  }, [qCaseId, caseId, startCase]);


  // 🔥 /cases는 무조건 “판례 메인 홈”
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>판례를 조회해주세요</h1>

      <div style={styles.placeholderBox}>
        {!mainError && (
          <>
            <p style={styles.placeholderText}>
              왼쪽 사이드바에서 사건번호를 입력하거나,
              판례 파일을 업로드해 분석을 시작하세요.
            </p>

            <ul
              style={{
                marginTop: 12,
                paddingLeft: 18,
                fontSize: 14,
                color: "#4b5563",
                lineHeight: 1.9,
              }}
            >
              <li>📎 업로드 가능한 파일은 <strong>PDF 형식</strong>만 지원합니다.</li>
              <li>📑 파일명은 <strong>법원명_사건번호.pdf</strong> 형식이어야 합니다.</li>
              <li>⏳ 분석에는 약 <strong>15-20분</strong> 정도 소요될 수 있습니다.</li>
            </ul>
          </>
        )}
      {/* {!mainError && 기본 안내} */}
      {mainError === "PDF_UNREADABLE" && <MainUploadError />}
      {mainError === "LOGIN_REQUIRED" && (<MainLoginRequiredNotice />)}
      {mainError === "SUBSCRIPTION_REQUIRED" && (<MainUploadSubscriptionRequiredNotice />)}
      {mainError === "CACHE_HIT" && <MainUploadCachedNotice />}
      {mainError === "CASE_LIMIT_EXCEEDED" && (<MainUploadLimitNotice />)}
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  container: {
    minHeight: "80vh",
    padding: "64px 24px 100px",
    backgroundColor: "#f5f6f8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  breadcrumb: {
    fontSize: "12px",
    color: "#9ca3af",
    alignSelf: "flex-start",
    marginBottom: "16px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "20px",
    lineHeight: 1.25,
  },
  placeholderBox: {
    width: "100%",
    maxWidth: "720px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  placeholderText: {
    fontSize: "14px",
    color: "#374151",
    lineHeight: 1.7,
    margin: 0,
  },
  link: {
    cursor: "pointer",
    textDecoration: "underline",
  },
};

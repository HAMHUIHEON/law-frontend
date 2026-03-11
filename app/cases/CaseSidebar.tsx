// law-frontend/app/cases/CaseSidebar.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCaseUI, CaseViewMode } from "./CaseUIContext";
import { useAuth } from "@clerk/nextjs";

const CASE_GREEN = "#065f46";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";


/** ---------------------------------------
 * 사건번호 정규화
 * ---------------------------------------
 * 예:
 *  - 서울중앙지방법원_2021노2087.pdf → 2021노2087
 *  - 2022구합7106 → 그대로
 */
function normalizeCaseId(raw: string): string | null {
  const v = raw.trim();

  // 2자리 또는 4자리 연도 + 한글 사건유형 + 숫자
  const m = v.match(/\b(\d{2}|\d{4})[가-힣]{1,3}\d+\b/);
  if (!m) return null;

  return m[0];
}


export default function CaseSidebar() {
  const { getToken } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();

  const {
  sidebarOpen,
  setSidebarOpen,
  viewMode,
  setViewMode,
  caseId,
  setCaseId,
  startCase,
  resetCase,
  mainError,
  setMainError,   // ✅ 이거
} = useCaseUI();

  const { isSignedIn } = useAuth(); 
  const initialFromQuery = useMemo(() => {
    const q = sp?.get("case_id");
    return q && q.trim() ? q.trim() : null;
  }, [sp]);

  const [draft, setDraft] = useState<string>(caseId ?? initialFromQuery ?? "");


  // upload state
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null); // 사이드바용
  
  const didHydrateFromQuery = useRef(false);

  useEffect(() => {
    if (didHydrateFromQuery.current) return;
    didHydrateFromQuery.current = true;

    if (initialFromQuery) {
      const normalized = normalizeCaseId(initialFromQuery);
      if (normalized) {
        startCase(normalized);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFromQuery]);


  useEffect(() => {
    setDraft(caseId ?? "");
  }, [caseId]);


  const commitCaseId = useCallback((value: string) => {
    if (!isSignedIn) {
      setMainError("LOGIN_REQUIRED");
      return;
    }

    const normalized = normalizeCaseId(value);
    if (!normalized) {
      setUploadErr("사건번호 형식을 인식할 수 없습니다.");
      return;
    }

    setUploadErr(null);
    setMainError(null);

    startCase(normalized);
    router.push(`/cases/flow?case_id=${encodeURIComponent(normalized)}`);
  }, [isSignedIn,router, startCase, setMainError]);

  const onUpload = useCallback(async (file: File) => {
    // ✅ 업로드 시작 시: 공통 초기화
    resetCase();
    setUploadErr(null);
    setUploading(true);
    setUploadDone(false);

    try {
      const fd = new FormData();
      fd.append("file", file, file.name);

      // 🔑 ① 토큰 생성
      const token = await getToken({ template: "backend-api" });

      // 🚨 토큰이 없으면: 서버로 가지 않는다
      if (!token) {
        setMainError("SUBSCRIPTION_REQUIRED"); // 로그인/구독 필요 안내
        setUploading(false);
        return;
      }

      // 🔑 ② 그리고 fetch에 헤더로 추가
      const res = await fetch(`${API_BASE}/api/cases/upload-and-run`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      // 🔴 0️⃣ 로그인 필요 (401)
      if (res.status === 401) {
        setMainError("LOGIN_REQUIRED");
        setUploading(false);
        return;
      }

      // 🔴 0️⃣ 구독 필요 (403)
      if (res.status === 403) {
        setMainError("SUBSCRIPTION_REQUIRED");
        setUploading(false);
        return;
      }

      // 🔴 1️⃣ 월간 분석 한도 초과
      if (res.status === 429) {
        setMainError("CASE_LIMIT_EXCEEDED");
        setUploading(false);
        return;
      }

      // 🔴 2️⃣ 기타 서버 에러
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Upload failed (${res.status})`);
      }

      // 🔴 3️⃣ 정상 응답만 JSON 파싱
      const json = await res.json();
      const normalized = normalizeCaseId(String(json.case_id ?? ""));
      if (!normalized) throw new Error("서버에서 유효한 사건번호를 받지 못했습니다.");


      // 🔴 4️⃣ 캐시 히트 처리
      if (json.cache_hit) {
        setMainError("CACHE_HIT");
        setCaseId(normalized);   // 🔑 조회칸에 바로 앉힘 (UX 유지)
        router.push(`/cases?case_id=${encodeURIComponent(normalized)}`);
        return;                 // 🔑 startCase 절대 타지 않음
      }

      // 🔴 5️⃣ 신규 분석
      startCase(normalized);
      router.push(`/cases?case_id=${encodeURIComponent(normalized)}`);

      setUploadDone(true);
      setTimeout(() => setUploadDone(false), 2500);
    } catch (e) {
      console.error("Upload error:", e);
      setUploadErr("❌ 업로드 실패");
      setMainError("PDF_UNREADABLE");
    } finally {
      setUploading(false);
    }
  }, [resetCase, startCase, router, setMainError]);

  if (!sidebarOpen) return null;

  const modes: [Exclude<CaseViewMode, "HOME">, string][] = [
    ["FLOW", "판례 흐름 요약"],
    ["STRUCTURE", "쟁점 분석 · 판단 구조"],
    ["PRACTICE", "핵심 법리 · 실무 활용"],
  ];


const routeByMode: Record<Exclude<CaseViewMode, "HOME">, string> = {
  FLOW: "/cases/flow",
  STRUCTURE: "/cases/structure",
  PRACTICE: "/cases/practice",
};


  return (
    <aside
      style={{
        width: 280,
        minWidth: 280,
        borderRight: "1px solid #e5e7eb",
        backgroundColor: "#fafafa",
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: 0,
      }}
    >
      {/* ================= 판례 조회 ================= */}
      <section>
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
          판례 조회
        </p>

        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="사건번호 입력 (예: 2022구합7106)"
          onKeyDown={(e) => {
            if (e.key === "Enter") commitCaseId(draft);
          }}
          style={{
            width: "100%",
            fontSize: 14,
            padding: "8px 10px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            background: "#fff",
          }}
        />

        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
          엔터로 조회합니다.
        </div>
      </section>

      {/* ================= 업로드 ================= */}
      <section>
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
          판례 파일 업로드
        </p>

        <input
          type="file"
          accept="application/pdf"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            void onUpload(f);
            e.currentTarget.value = "";
          }}
          style={{
            width: "100%",
            fontSize: 13,
            padding: "8px 10px",
            border: "1px dashed #a7f3d0",
            borderRadius: 6,
            background: "#ecfdf5",
            color: CASE_GREEN,
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        />

        {uploading && (
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
            ⏳ 업로드 / 분석 실행 중…
          </div>
        )}

        {uploadDone && (
          <div
            style={{
              marginTop: 8,
              padding: "6px 8px",
              borderRadius: 6,
              background: "#ecfdf5",
              color: CASE_GREEN,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            ✅ 분석 완료
          </div>
        )}

        {uploadErr && (
          <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 8 }}>
            {uploadErr}
          </div>
        )}
      </section>

      {/* ================= 보기 방식 ================= */}
      <section>
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
          보기 방식
        </p>

        {modes.map(([mode, label]) => (
          <label
            key={mode}
            style={{ display: "block", fontSize: 14, marginBottom: 6 }}
          >
            <input
              type="radio"
              checked={viewMode === mode}
              onChange={() => {
                setViewMode(mode);
                // ✅ 판례가 선택된 상태일 때만 이동
                if (caseId) router.push(routeByMode[mode]);
              }}
            />
            {" "}
            {label}
          </label>
        ))}
      </section>
      {/* ================= 쟁점 검색 ================= */}
      <section>
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
          쟁점 검색
        </p>

        <button
          onClick={() => router.push("/cases/search")}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🔎 쟁점 기반 판례 검색
        </button>

        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
          쟁점 키워드로 유사 판례를 찾습니다.
        </div>
      </section>
      
      <hr style={{ borderTop: "1px solid #e5e7eb" }} />

      <button
        onClick={() => setSidebarOpen(false)}
        style={{
          marginTop: 6,
          width: "100%",
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          background: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        사이드바 닫기
      </button>
    </aside>
  );
}

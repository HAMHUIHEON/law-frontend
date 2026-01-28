//app/me/subscribe/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function SubscribePage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>
        구독이 필요합니다
      </h1>

      <p style={{ fontSize: 14, color: "#6b7280" }}>
        판례 C 리포트 전체 내용은 구독 후 확인할 수 있습니다.
      </p>

      <button
        onClick={() => alert("결제는 다음 단계에서 연결됩니다")}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          background: "#111827",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        구독 시작하기
      </button>

      <button
        onClick={() => router.back()}
        style={{
          background: "none",
          border: "none",
          color: "#6b7280",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        ← 돌아가기
      </button>
    </main>
  );
}

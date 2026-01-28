// app/me/unsubscribe/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function UnsubscribePage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        padding: "96px 24px 140px",
        color: "rgba(255,255,255,0.92)",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          구독 멤버십을 해지하시겠어요?
        </h1>

        <p
          style={{
            fontSize: 15,
            lineHeight: 1.9,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 32,
          }}
        >
          멤버십을 해지하더라도
          <br />
          <strong>현재 결제 주기가 끝날 때까지</strong>는
          <br />
          구독 기능을 그대로 이용하실 수 있습니다.
        </p>

        <p
          style={{
            fontSize: 13,
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.55)",
            marginBottom: 40,
          }}
        >
          · 이미 이용한 구독 서비스에 대해서는 환불이 어렵습니다.  
          <br />
          · 결제 후 7일 이내이며 구독 서비스를 이용하지 않은 경우에 한해
          환불이 가능합니다.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.35)",
              background: "transparent",
              color: "rgba(255,255,255,0.8)",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            돌아가기
          </button>

          <button
            onClick={async () => {
              await fetch("/api/me/unsubscribe", { method: "POST" });
              router.push("/me");
            }}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #ffffff",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            구독 해지하기
          </button>
        </div>
      </div>
    </main>
  );
}

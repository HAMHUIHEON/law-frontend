"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UnsubscribePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"confirm" | "done">("confirm");
  const [loading, setLoading] = useState(false);

  // =========================
  // 해지 완료 화면
  // =========================
  if (status === "done") {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          padding: "96px 24px 140px",
          color: "rgba(255,255,255,0.92)",
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 26,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            멤버쉽 해지가 완료되었습니다
          </h1>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.9,
              color: "rgba(255,255,255,0.7)",
              marginBottom: 32,
            }}
          >
            현재 결제 주기가 끝날 때까지는
            <br />
            멤버쉽 기능을 계속 이용하실 수 있습니다.
          </p>

          <button
            onClick={() => router.push("/me")}
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "1px solid #ffffff",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            마이페이지로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // 해지 확인 화면
  // =========================
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
          멤버십을 해지하시겠어요?
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
          유료 서비스 기능을 그대로 이용하실 수 있습니다.
        </p>

        <p
          style={{
            fontSize: 13,
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.55)",
            marginBottom: 40,
          }}
        >
          · 이미 이용한 유료 서비스에 대해서는 환불이 어렵습니다.
          <br />
          · 결제 후 7일 이내이며 멤버쉽 서비스를 이용하지 않은 경우에 한해
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
              setLoading(true);
              await fetch("/api/me/unsubscribe", { method: "POST" });
              setStatus("done");
            }}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #ffffff",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "처리 중…" : "멤버쉽 해지하기"}
          </button>
        </div>
      </div>
    </main>
  );
}

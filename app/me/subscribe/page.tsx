// app/me/subscribe/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function SubscribePage() {
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
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* ================= HERO ================= */}
        <section style={{ marginBottom: 64 }}>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 700,
              lineHeight: 1.25,
              marginBottom: 18,
              letterSpacing: "-0.01em",
            }}
          >
            판례를 읽다 보면
            <br />
            어디서부터 생각해야 할지
            <br />
            막히는 순간이 있습니다
          </h1>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.65)",
              maxWidth: 680,
            }}
          >
            이 페이지는 그런 순간을 위해 만들어졌습니다.
            <br />
            판결의 결론이 아니라,
            <br />
            법원이 어떤 순서로 판단했는지를
            <br />
            하나씩 따라가 볼 수 있도록 돕습니다.
            </p>
        </section>

        {/* ================= WHY LOCKED ================= */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={sectionTitle}>지금 보고 계셨던 분석에 대해</h2>

          <p style={paragraph}>
            C 리포트는 판결 내용을 요약하는 대신,
            <br />
            쟁점이 어떻게 정리되고
            <br />
            어떤 논증을 거쳐 결론에 이르렀는지를
            <br />
            구조 그대로 보여주는 분석입니다.
            </p>

          <p style={paragraph}>
              실제 업무에서
            <br />
            “왜 이런 판단이 나왔는지”를 설명해야 할 때,
            <br />
            이 구조가 그대로 기준이 되기 때문에
            <br />
            <strong> 구독자 전용</strong>으로 제공됩니다.
          </p>
        </section>

        {/* ================= WHAT YOU GET ================= */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={sectionTitle}>구독 시 이용할 수 있는 내용</h2>

          <ul style={{ paddingLeft: 18, lineHeight: 1.9 }}>
            <li>✅ 판례의 쟁점별 논증 구조 전체</li>
            <li>✅ 법원이 판단에 이르기까지의 사고 흐름</li>
            <li>✅ 각 쟁점에서 적용된 법리와 기준</li>
            <li>✅ 판례 업로드 및 분석 실행</li>
            <li>✅ 저장 · 재열람 · 사고 히스토리 관리</li>
          </ul>
        </section>

        {/* ================= WHO IT IS FOR ================= */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={sectionTitle}>이 서비스는 이런 분을 위한 것입니다</h2>

          <ul style={{ paddingLeft: 18, lineHeight: 1.9 }}>
            <li>
              판례를 단순히 요약하는 것이 아니라
              <strong> 왜 그렇게 판단됐는지</strong>를 이해하고 싶은 분
            </li>
            <li>
              실무에서 판례를
              <strong> 구조적으로 인용</strong>해야 하는 분
            </li>
            <li>
              판례 읽는 감각을
              <strong> 사고 체계로 만들고 싶은 분</strong>
            </li>
          </ul>
        </section>

        {/* ================= CTA ================= */}
        <section
          style={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 48,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            월 구독
          </p>

          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 28,
            }}
          >
            ₩ XX,XXX / 월
          </p>

          <button
            onClick={async () => {
              await fetch("/api/me/subscribe", { method: "POST" });
              router.push("/cases"); // 구독 후 다시 판례로
            }}
            style={{
              padding: "14px 22px",
              borderRadius: 10,
              border: "1px solid #ffffff",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            구독하여 전체 판례 분석 보기
          </button>

          <p
            style={{
              marginTop: 14,
              fontSize: 12,
              color: "rgba(255,255,255,0.55)",
            }}
            >
            구독 멤버십은 결제일로부터 7일 이내에 서비스를 이용하지 않은 경우에 한해 환불이 가능합니다.
            <br />
            이미 구독 서비스를 이용했거나, 결제일로부터 7일이 지난 경우에는 환불이 제공되지 않습니다.
            <br /><br />
            멤버십 해지는 언제든 ‘계정’ 페이지에서 가능하며,
            해지하더라도 현재 결제 주기가 끝날 때까지는 구독 기능을 계속 이용하실 수 있습니다.
            </p>
        </section>
      </div>
    </main>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 16,
};

const paragraph: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.9,
  color: "rgba(255,255,255,0.7)",
  marginBottom: 16,
};

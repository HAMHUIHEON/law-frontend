// app/me/subscribe/page.tsx
"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

/* =========================
 * COPY (네가 만든 거 그대로)
 * ========================= */
const COPY_BY_FROM = {
  case: {
    heroTitle: (
      <>
        판례를 읽다 보면
        <br />
        어디서부터 생각해야 할지
        <br />
        막히는 순간이 있습니다
      </>
    ),
    heroDesc: (
      <>
        이 서비스는 판결의 결론이 아니라,
        <br />
        법원이 어떤 순서로 판단했는지를
        <br />
        쟁점과 논증 구조로 따라가도록 설계되었습니다.
      </>
    ),
    whyLocked: (
      <>
        이러한 분석은
        <br />
        판례를 읽는 단계를 넘어
        <br />
        판단의 기준을
        <br />
        자신의 사고 자산으로 만드는 영역이기 때문에
        <strong> 구독자 전용</strong>으로 제공됩니다.
      </>
    ),
    benefits: [
      "판례의 쟁점별 논증 구조 전체",
      "법원이 판단에 이르기까지의 사고 흐름",
      "각 쟁점에서 적용된 법리와 기준",
      "판례 업로드 및 분석 실행",
    ],
    afterPath: "/cases",
    cta: "구독하여 전체 판례 분석 보기",
  },

  law: {
    heroTitle: (
      <>
        법령을 읽다 보면
        <br />
        요건과 판단의 경계가
        <br />
        흐려지는 순간이 있습니다
      </>
    ),
    heroDesc: (
      <>
        이 서비스는 조문을 나열하지 않고,
        <br />
        적용 요건 · 효과 · 예외를
        <br />
        판단의 흐름 속에서 정리해 줍니다.
      </>
    ),
    whyLocked: (
      <>
        법령 정보를 제공하는 것을 넘어
        <br />
        판단의 흐름을 이해하기 위한
        <br />
        분석 자료 성격의 콘텐츠이기 때문에
        <strong> 구독자 전용</strong>으로 제공됩니다.
      </>
    ),
    benefits: [
      "법령 해석(Semantic) 단계 열람",
      "적용 요건 · 효과 · 예외 구조화된 정리",
      "판단 단계(Reasoning) 흐름 전체",
      "조문 ↔ 판단 단계 간 연계 탐색",
    ],
    afterPath: "/law",
    cta: "구독하여 전체 법령 분석 보기",
  },

  strategy: {
    heroTitle: (
      <>
        전략은
        <br />
        정보가 아니라
        <br />
        사고의 순서입니다
      </>
    ),
    heroDesc: (
      <>
        이 서비스는
        <br />
        쟁점을 어떻게 세우고
        <br />
        판단을 어떤 순서로 진행할지를
        <br />
        사고 구조로 정리해 보여줍니다.
      </>
    ),
    whyLocked: (
      <>
        이 기능은
        <br />
        사고 과정을 자산화하는 영역이기 때문에
        <br />
        <strong> 구독자 전용</strong>으로 제공됩니다.
      </>
    ),
    benefits: [
      "전략 단위 사고 구조 전체 열람",
      "쟁점 설정 → 판단 흐름 설계 방식",
      "사고 단계별 구조화된 전략 정리",
    ],
    afterPath: "/strategy",
    cta: "구독하여 전체 전략 보기",
  },
} as const;

/* =========================
 * Inner (실제 페이지)
 * ========================= */
function SubscribePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const from = (searchParams.get("from") ?? "case") as keyof typeof COPY_BY_FROM;
  const copy = COPY_BY_FROM[from] ?? COPY_BY_FROM.case;

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
        {/* HERO */}
        <section style={{ marginBottom: 64 }}>
          <h1 style={heroTitleStyle}>{copy.heroTitle}</h1>
          <p style={heroDescStyle}>{copy.heroDesc}</p>
        </section>

        {/* WHY LOCKED */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={sectionTitle}>지금 보고 계셨던 분석에 대해</h2>
          <p style={paragraph}>{copy.whyLocked}</p>
        </section>

        {/* BENEFITS */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={sectionTitle}>구독 시 이용할 수 있는 내용</h2>
          <ul style={{ paddingLeft: 18, lineHeight: 1.9 }}>
            {copy.benefits.map((b, i) => (
              <li key={i}>✅ {b}</li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section style={ctaSectionStyle}>
          <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>월 구독</p>
          <p style={{ fontSize: 28, fontWeight: 700, marginBottom: 28 }}>₩ XX,XXX / 월</p>

        <button
          onClick={async () => {
            const IMP = (window as any).IMP;
            if (!IMP) {
              alert("결제 모듈 로딩 실패");
              return;
            }

            // 1️⃣ 포트원 초기화
            IMP.init("imp05017267"); // 포트원 대시보드에서 본 imp_XXXX

            // 2️⃣ merchant_uid 생성 (🔥 중요)
            if (!userId) {
              alert("로그인이 필요합니다");
              return;
            }

            const merchant_uid = `subscribe_${userId}_${Date.now()}`;


            // 3️⃣ 결제 요청
            IMP.request_pay(
              {
                pg: "html5_inicis", // 
                pay_method: "card",
                merchant_uid,
                name: "월 구독 멤버십",
                amount: 1000, // 테스트 금액 (원)
                buyer_email: "test@test.com",
                buyer_name: "테스트 사용자",
              },
              (rsp: any) => {
                if (rsp.success) {
                  alert("결제가 완료되었습니다.");
                  // ❗ 여기서 권한 바꾸지 마
                  // webhook이 처리함
                  router.push("/me");
                } else {
                  alert("결제 실패: " + rsp.error_msg);
                }
              }
            );
          }}
          style={ctaButtonStyle}
        >
          {copy.cta}
        </button>
         <p
              style={{
                marginTop: 14,
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.6,
                maxWidth: 640,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              구독 멤버십은 결제일로부터 7일 이내에 서비스를 이용하지 않은 경우에 한해 환불이 가능합니다.
              <br />
              이미 구독 서비스를 이용했거나, 결제일로부터 7일이 지난 경우에는 환불이 제공되지 않습니다.
              <br /><br />
              멤버십 해지는 언제든 ‘계정’ 페이지에서 가능하며 해지하더라도,
              <br />
              현재 결제 주기가 끝날 때까지는 구독 기능을 계속 이용하실 수 있습니다.
            </p>          
          </section>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => router.push("/me")}
              style={{
                marginTop: 24,
                background: "none",
                border: "none",
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.45)";
              }}
            >
              ← 이전 화면으로 돌아가기
            </button>
          </div>
      </div>
    </main>
  );
}

/* =========================
 * Suspense Wrapper
 * ========================= */
export default function SubscribePage() {
  return (
    <Suspense fallback={<p style={{ padding: 32 }}>불러오는 중…</p>}>
      <SubscribePageInner />
    </Suspense>
  );
}

/* =========================
 * Styles
 * ========================= */
const heroTitleStyle = {
  fontSize: 34,
  fontWeight: 700,
  lineHeight: 1.25,
  marginBottom: 18,
  letterSpacing: "-0.01em",
};

const heroDescStyle = {
  fontSize: 16,
  lineHeight: 1.8,
  color: "rgba(255,255,255,0.65)",
  maxWidth: 680,
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 16,
};

const paragraph = {
  fontSize: 15,
  lineHeight: 1.9,
  color: "rgba(255,255,255,0.7)",
};

const ctaSectionStyle = {
  borderTop: "1px solid rgba(255,255,255,0.12)",
  paddingTop: 48,
  textAlign: "center" as const,
};

const ctaButtonStyle = {
  padding: "14px 22px",
  borderRadius: 10,
  border: "1px solid #ffffff",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};




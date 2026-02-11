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
        <strong> 멤버쉽 전용</strong>으로 제공됩니다.
      </>
    ),
    benefits: [
      "판례의 쟁점별 논증 구조 전체",
      "법원이 판단에 이르기까지의 사고 흐름",
      "각 쟁점에서 적용된 법리와 기준",
      "판례 업로드 및 분석 실행",
    ],
    afterPath: "/cases",
    cta: "멤버십 가입하고 전체 분석 열람하기",
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
        <strong> 멤버쉽 전용</strong>으로 제공됩니다.
      </>
    ),
    benefits: [
      "법령 해석(Semantic) 단계 열람",
      "적용 요건 · 효과 · 예외 구조화된 정리",
      "판단 단계(Reasoning) 흐름 전체",
      "조문 ↔ 판단 단계 간 연계 탐색",
    ],
    afterPath: "/law",
    cta: "멤버십 가입하고 전체 해석 보기",
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
        <strong> 멤버쉽 전용</strong>으로 제공됩니다.
      </>
    ),
    benefits: [
      "전략 단위 사고 구조 전체 열람",
      "쟁점 설정 → 판단 흐름 설계 방식",
      "사고 단계별 구조화된 전략 정리",
    ],
    afterPath: "/strategy",
    cta: "멤버십 가입하고 전 영역 열람하기",
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
          <h2 style={sectionTitle}>월 멤버십으로 이용할 수 있는 전체 기능</h2>
          <ul style={{ paddingLeft: 18, lineHeight: 1.9 }}>
            {copy.benefits.map((b, i) => (
              <li key={i}>✅ {b}</li>
            ))}
          </ul>
          <p
          style={{
            marginTop: 18,
            fontSize: 14,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.8,
          }}
        >
          본 멤버십은 단일 기능 이용권이 아닌,
          <br />
           <strong>판례 · 법령 · 전략 전 영역의 분석 기능을 하나로 통합한 월 이용권</strong>입니다.
          <br />
          <strong>하나의 멤버십으로 전 영역 이용</strong>이 가능합니다.
        </p>
        </section>

        {/* CTA */}
        <section style={ctaSectionStyle}>
          <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>월 결제 이용권</p>
          <p style={{ fontSize: 28, fontWeight: 700, marginBottom: 28 }}>₩ 29,800/ 월</p>

        <button
        onClick={async () => {
          const IMP = (window as any).IMP;
          if (!IMP) {
            alert("결제 모듈 로딩 실패");
            return;
          }

          if (!userId) {
            alert("로그인이 필요합니다");
            return;
          }

          // ✅ 1️⃣ merchant_uid 생성 (의미 없는 UUID)
          const merchant_uid = crypto.randomUUID();

          // ✅ 2️⃣ 서버에 주문 먼저 생성
          const res = await fetch("/api/payment/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ merchant_uid }),
          });

          if (!res.ok) {
            alert("주문 생성 실패");
            return;
          }

          // ✅ 3️⃣ 포트원 결제 요청
          IMP.init("imp05017267");

          IMP.request_pay(
            {
              pg: "html5_inicis",
              pay_method: "card",
              merchant_uid,
              name: "월 이용 멤버십",
              amount: 29800, // 테스트 금액
              buyer_email: "yoonsuel_m@naver.com",
              buyer_name: "테스트 사용자",
            },
            (rsp: any) => {
              if (rsp.success) {
                alert("결제가 완료되었습니다.");
                // ❗ 권한 반영은 웹훅에서
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
              월 멤버십은 결제일로부터 7일 이내,
              서비스를 이용하지 않은 경우에 한해 환불이 가능합니다.
              <br />
              이미 유료 기능을 이용했거나, 7일이 경과한 경우에는 환불이 제공되지 않습니다.
              <br /><br />
              멤버십 해지는 언제든 ‘계정’ 페이지에서 가능합니다.<br />
              해지하더라도 현재 결제 주기가 종료될 때까지는
              멤버십 기능을 계속 이용하실 수 있습니다.
            </p> 
            <p
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.6,
                  maxWidth: 640,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
              본 서비스는 1개월 이용권 방식으로 제공되며 자동 갱신되지 않습니다.
              <br />
              이용 기간 종료 전에 안내를 드리며,
              원하시는 경우 언제든 다시 결제하실 수 있습니다.
              </p>
                      
          </section>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => router.push("/enter")}
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
              ← 메인 화면으로 이동
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




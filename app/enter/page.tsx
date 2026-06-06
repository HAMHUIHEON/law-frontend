// law-frontend/app/enter/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { LegalLinks } from "./LegalLinks";


export default function HomePage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <main style={styles.container}>
    <LegalLinks />
    <div style={styles.topUtility}>
      <SignedOut>
        <SignInButton mode="modal">
          <button style={styles.utilityButton}>
            Login
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <button
          style={styles.utilityButton}
          onClick={() => router.push("/me")}
        >
          MyPage
        </button>
        <UserButton />
      </SignedIn>
    </div>
      <h1 style={styles.title}>어떤 관점에서 살펴보고 싶으신가요?</h1>
      <p style={styles.subtitle}>
      판례 · 법령 · 전략 · AI 에이전트 중 하나를 선택해 시작하세요.
      </p>
      <div style={styles.cardContainer}>
      <button
        style={{
          ...styles.card,
          ...(hovered === 0 ? styles.cardHover : {}),
        }}
        onMouseEnter={() => setHovered(0)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => router.push("/cases")}
      >
          <div
            style={{
              ...styles.cardTitle,
              ...(hovered === 0 ? styles.cardTitleHover : {}),
            }}
          >
            <h2>판례를 이해해야 하는 상황이에요</h2>
          </div>
          
        <div
          style={{
            ...styles.cardDesc,
          borderLeft: `3px solid ${depthColors.A}`,
          }}
        >   
         <p>
          판례의 쟁점과 판단 구조를 따라가며<br/>
          사건이 어떤 논증을 통해 결론에 이르렀는지 살펴봐요.
        </p>
        </div>
        </button>

      <button
        style={{
          ...styles.card,
          ...(hovered === 1 ? styles.cardHover : {}),
        }}
        onMouseEnter={() => setHovered(1)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => router.push("/law")}
      >
          <div
            style={{
              ...styles.cardTitle,
              ...(hovered === 1 ? styles.cardTitleHover : {}),
            }}
          >

            <h2>특정 법령의 구조와 의미를 보고 싶어요</h2>
          </div>
        <div
          style={{
            ...styles.cardDesc,
            borderLeft: `3px solid ${depthColors.B}`,
          }}
        >   
            <p>
            조문과 쟁점 구조를 통해<br/>
            법령이 실제로 어떻게 작동하는지 살펴봐요.
            </p>
          </div>
        </button>

      <button
        style={{
          ...styles.card,
          ...(hovered === 2 ? styles.cardHover : {}),
        }}
        onMouseEnter={() => setHovered(2)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => router.push("/strategy")}
      >
          <div
            style={{
              ...styles.cardTitle,
              ...(hovered === 2 ? styles.cardTitleHover : {}),
            }}
          >
            <h2>실무적으로 어떻게 대응할지 판단하고 싶어요</h2>
          </div>
        <div
          style={{
            ...styles.cardDesc,
            borderLeft: `3px solid ${depthColors.C}`,

          }}
        >   
            <p>
              실무 관점에서 어떤 판단 포인트가 중요한지<br/>
              전략적 대응 방향을 정리해요.
            </p>
          </div>
        </button>

      <button
        style={{
          ...styles.card,
          ...(hovered === 3 ? styles.cardHover : {}),
        }}
        onMouseEnter={() => setHovered(3)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => router.push("/agent")}
      >
          <div
            style={{
              ...styles.cardTitle,
              ...(hovered === 3 ? styles.cardTitleHover : {}),
            }}
          >
            <h2>AI 에이전트에게 직접 물어보고 싶어요</h2>
          </div>
        <div
          style={{
            ...styles.cardDesc,
            borderLeft: `3px solid ${depthColors.D}`,
          }}
        >
            <p>
              판례 DB와 법령을 교차 탐색해<br/>
              질문에 맞는 전략 보고서를 자동 생성해요.
            </p>
          </div>
        </button>
      </div>
    </main>
  );
}
const depthColors = {
  A: "#059669", // 초록
  B: "#1d4ed8", // 남색
  C: "#6d28d9", // 보라
  D: "#0891b2", // 청록 (AI 에이전트)
};


const styles = {
  container: {
    minHeight: "100vh",
    padding: "60px 24px 100px", // 🔑 footer 높이 + 여유
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    backgroundColor: "#111827", // lapis 계열 다크 네이비

  },
topUtility: {
  position: "absolute" as const,
  top: "20px",
  right: "32px",
  display: "flex",
  gap: "16px",
},

utilityButton: {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: "13px",
  color: "rgba(255,255,255,0.55)",
  cursor: "pointer",
  letterSpacing: "0.02em",
},

  title: {
    fontSize: "32px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.88)",
    marginBottom: "10px",   //기존 48
    lineHeight: 1.3,
  },

  cardContainer: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
    maxWidth: "640px",
    width: "100%",
  },
card: {
  padding: "24px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.03)",
  backgroundColor: "rgba(236,239,244,0.88)",
  textAlign: "left" as const,
  cursor: "pointer",
  boxShadow: "0 1px 1px rgba(0,0,0,0.12)",
  transition: "transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease",
},

cardActive: {
    transform: "translateY(0)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

cardHover: {
  backgroundColor: "rgba(245,247,250,0.95)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: `
    0 10px 22px rgba(0,0,0,0.35),
    0 2px 6px rgba(0,0,0,0.18)
  `,
  transform: "translateY(-3px)",
},

cardTitle: {
  fontSize: "18px",
  fontWeight: 600,
  marginBottom: "8px",
  color: "#111827", // 완전 검정 말고
},

  cardTitleHover: {
    color: "#111827",
    letterSpacing: "-0.004em",
  },

cardDesc: {
  fontSize: "14px",
  color: "#4b5563", // 기존보다 살짝 딥
  paddingLeft: "12px",
  borderLeft: "3px solid #e5e5e5",
  lineHeight: 1.6,
},
subtitle: {
  fontSize: "14px",
  color: "rgba(255,255,255,0.6)",
  marginBottom: "32px",
},
};



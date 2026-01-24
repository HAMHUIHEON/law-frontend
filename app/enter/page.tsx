// law-frontend/app/enter/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <main style={styles.container}>
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
      <div style={styles.titleSpacer} />
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
         <p>사건의 개요와 결론을 중심으로 핵심만 정리해요.</p>
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
            <p>조문 하나가 아니라 전체 맥락을 이해하고 싶어요.</p>
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
            <p>실무 관점의 판단 포인트와 전략이 필요해요.</p>
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
};


const styles = {
  container: {
    minHeight: "80vh",
    padding: "80px 24px 100px", // 위쪽을 더 위로가
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    backgroundColor: "#111827", // lapis 계열 다크 네이비

  },
topUtility: {
  position: "absolute" as const,
  top: "28px",
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
    marginBottom: "52px",   // ↓ 기존 48px → 32px
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

  titleSpacer: {
    height: "12px",
  },
};



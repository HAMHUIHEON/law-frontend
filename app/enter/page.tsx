// law-frontend/app/enter/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { LegalLinks } from "./LegalLinks";

const AGENTS = [
  {
    key: "MULTI",
    title: "종합 리서치",
    desc: "판례 DB + ITCL 국제조세조정법을 동시에 탐색해 종합 보고서 생성",
    color: "#1e40af",
    badge: "멀티 에이전트",
  },
  {
    key: "INSIGHT",
    title: "판례 심층 분석",
    desc: "쿼리 분해 → 판례 탐색 → 사건번호 기반 전략 보고서",
    color: "#7c3aed",
    badge: "InsightAgent",
  },
  {
    key: "TAXLAW_PREC",
    title: "법원 판례 검색",
    desc: "국세청 taxlaw 32,628건 법원 판례 — 국승/국패·세법 유형별 분석",
    color: "#065f46",
    badge: "32,000+ 판례",
  },
  {
    key: "TAXTR",
    title: "조세심판 재결례",
    desc: "조세심판원 2,463건 재결례 DB — 유사 사건 검색 및 전략 분석",
    color: "#92400e",
    badge: "2,463건",
  },
];

export default function EnterPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <main style={styles.container}>
      <LegalLinks />
      <div style={styles.topUtility}>
        <SignedOut>
          <SignInButton mode="modal">
            <button style={styles.utilityButton}>Login</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <button style={styles.utilityButton} onClick={() => router.push("/me")}>
            MyPage
          </button>
          <UserButton />
        </SignedIn>
      </div>

      <div style={styles.brand}>LAPIS NEXUS</div>
      <h1 style={styles.title}>AI 에이전트와 대화하세요</h1>
      <p style={styles.subtitle}>
        세법 판례·재결례 DB를 탐색하는 4개의 에이전트가 준비되어 있습니다.
      </p>

      <div style={styles.cardContainer}>
        {AGENTS.map((agent, i) => (
          <button
            key={agent.key}
            style={{
              ...styles.card,
              ...(hovered === i ? styles.cardHover : {}),
              borderTop: `3px solid ${agent.color}`,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => router.push("/agent")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <h2 style={{ ...styles.cardTitle, color: hovered === i ? agent.color : "#111827" }}>
                {agent.title}
              </h2>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: agent.color,
                background: `${agent.color}12`,
                border: `1px solid ${agent.color}30`,
                borderRadius: 999,
                padding: "2px 8px",
                whiteSpace: "nowrap" as const,
                flexShrink: 0,
                marginLeft: 8,
              }}>
                {agent.badge}
              </span>
            </div>
            <p style={styles.cardDesc}>{agent.desc}</p>
          </button>
        ))}
      </div>

      <button
        style={{
          ...styles.ctaButton,
          ...(hovered === 99 ? styles.ctaButtonHover : {}),
        }}
        onMouseEnter={() => setHovered(99)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => router.push("/agent")}
      >
        에이전트 시작하기 →
      </button>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    padding: "60px 24px 100px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  topUtility: {
    position: "absolute",
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
  brand: {
    fontSize: "13px",
    letterSpacing: "0.32em",
    fontWeight: 500,
    color: "rgba(255,255,255,0.4)",
    marginBottom: "32px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "32px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.88)",
    marginBottom: "10px",
    lineHeight: 1.3,
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.55)",
    marginBottom: "36px",
    textAlign: "center",
  },
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    maxWidth: "680px",
    width: "100%",
    marginBottom: "32px",
  },
  card: {
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "rgba(236,239,244,0.9)",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    transition: "transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease",
  },
  cardHover: {
    backgroundColor: "rgba(245,247,250,0.97)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.12)",
    transform: "translateY(-2px)",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.3,
    transition: "color 150ms ease",
  },
  cardDesc: {
    fontSize: "12px",
    color: "#4b5563",
    lineHeight: 1.6,
    margin: 0,
  },
  ctaButton: {
    padding: "13px 36px",
    borderRadius: "10px",
    border: "none",
    background: "#1e40af",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.03em",
    transition: "background 160ms ease, transform 160ms ease",
  },
  ctaButtonHover: {
    background: "#1d3a9e",
    transform: "translateY(-1px)",
  },
};

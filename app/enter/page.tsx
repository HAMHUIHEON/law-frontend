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
    badge: "멀티 에이전트",
    color: "#1e40af",
    desc: "판례 DB + 세법 조문 + 조세심판 재결례를 동시에 탐색해 종합 보고서 생성. 복잡한 세법 쟁점의 시작점.",
    chips: ["판례·법령 교차 분석", "Neo4j 그래프 탐색", "종합 보고서 생성"],
  },
  {
    key: "INSIGHT",
    title: "판례 심층 분석",
    badge: "InsightAgent",
    color: "#7c3aed",
    desc: "쿼리 분해 → 판례 탐색 → 사건번호 기반 판결문 심층 분석 → 전략 보고서 생성.",
    chips: ["쿼리 자동 분해", "핵심 쟁점 추출", "당사자 입장 분석", "선례 시그널"],
  },
  {
    key: "TAXLAW_PREC",
    title: "법원 판례 검색",
    badge: "32,628건",
    color: "#065f46",
    desc: "국세청 taxlaw.nts.go.kr에서 수집한 32,628건 세법 법원 판례 벡터 검색. 국승/국패·세법 유형별 분류.",
    chips: ["국승/국패 분류", "세법 유형 필터", "유사도 기반 검색"],
  },
  {
    key: "TAXTR",
    title: "조세심판 재결례",
    badge: "2,463건",
    color: "#92400e",
    desc: "조세심판원 2,463건 재결례 DB에서 유사 사건 검색. 인용·취소·기각 패턴과 승소 전략 분석.",
    chips: ["재결례 벡터 검색", "인용·취소 필터", "결정 패턴 분석"],
  },
  {
    key: "STRATEGY",
    title: "불복전략 분석",
    badge: "전략 에이전트",
    color: "#0f766e",
    desc: "사건 개요를 입력하면 유사 판례·재결례에서 구체적 불복전략을 도출. 심사청구·심판청구·행정소송 단계별 전략.",
    chips: ["유사 사건 검색", "불복 단계 전략", "판례·재결례 교차"],
  },
  {
    key: "REBUTTAL",
    title: "반론 초안 작성",
    badge: "RebuttalAgent",
    color: "#c2410c",
    desc: "과세처분 이유서를 붙여넣으면 납세자 승소 판례와 인용 재결례만 필터링해 반론 초안을 자동 생성.",
    chips: ["승소 판례 필터링", "반론 초안 생성", "Reflection 검토"],
  },
  {
    key: "TREND",
    title: "판례 트렌드 분석",
    badge: "TrendAgent",
    color: "#0369a1",
    desc: "쟁점 입력 시 관련 판례의 연도별 건수·납세자 승소율을 집계하고 최근 판례 흐름 해설 보고서를 생성.",
    chips: ["연도별 승소율", "트렌드 시각화", "흐름 해설 보고서"],
  },
  {
    key: "ITCL",
    title: "국제조세 분석",
    badge: "ITCLAgent",
    color: "#6d28d9",
    desc: "국제조세조정법 쟁점 입력 시 관련 판례·법령 조문·Neo4j 그래프 쟁점을 통합 분석. 이전가격·GLOBE 전문.",
    chips: ["이전가격 판례", "ITCL 법령 조문", "Neo4j 쟁점 그래프"],
  },
  {
    key: "RISK",
    title: "개정법령 리스크",
    badge: "RiskAgent",
    color: "#b91c1c",
    desc: "법령명·개정 내용·시행일을 입력하면 기존 판례·재결례 중 영향받는 사건을 식별하고 리스크 보고서 생성.",
    chips: ["영향 판례 식별", "개정 조문 매핑", "시행일 기준 필터"],
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
        32,628건 법원 판례 · 2,463건 조세심판 재결례 · 14개 세법 조문을 탐색하는 9개 에이전트
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
              {agent.chips.map((chip) => (
                <span key={chip} style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 999,
                  background: hovered === i ? `${agent.color}14` : "#f3f4f6",
                  color: hovered === i ? agent.color : "#6b7280",
                  border: `1px solid ${hovered === i ? agent.color + "30" : "#e5e7eb"}`,
                  fontWeight: 500,
                  transition: "all 0.15s ease",
                }}>
                  {chip}
                </span>
              ))}
            </div>
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
    alignItems: "center",
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
    fontSize: "13px",
    color: "rgba(255,255,255,0.45)",
    marginBottom: "40px",
    textAlign: "center",
    lineHeight: 1.6,
  },
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "14px",
    maxWidth: "900px",
    width: "100%",
    marginBottom: "36px",
  },
  card: {
    padding: "18px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "rgba(236,239,244,0.92)",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
    transition: "transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease",
  },
  cardHover: {
    backgroundColor: "rgba(245,247,250,0.98)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.12)",
    transform: "translateY(-2px)",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.3,
    transition: "color 150ms ease",
  },
  cardDesc: {
    fontSize: "11px",
    color: "#4b5563",
    lineHeight: 1.65,
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

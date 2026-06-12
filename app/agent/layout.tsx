"use client";

import { AgentUIProvider, useAgentUI, AgentType } from "./AgentUIContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import React from "react";

const AGENT_BLUE = "#1e40af";

const AGENT_LABELS: Record<AgentType, { name: string; desc: string; placeholder: string; color: string }> = {
  MULTI: {
    name: "종합 리서치",
    desc: "판례·재결례·14개 세법 조문을 결합한 멀티 에이전트",
    placeholder: "예) 이전가격 조작으로 인한 과세처분 취소 판례의 공통된 판단 기준은?",
    color: "#1e40af",
  },
  INSIGHT: {
    name: "판례 심층 분석",
    desc: "특정 판례 또는 쟁점 중심 전략 보고서",
    placeholder: "예) 이 판례에서 법원이 납세자 승소 판결을 내린 핵심 근거는?",
    color: "#7c3aed",
  },
  TAXLAW_PREC: {
    name: "법원 판례 검색",
    desc: "국세청 taxlaw 32,000+ 법원 판례 — 세법 유형·결정별 검색",
    placeholder: "예) 부가가치세 매입세액 불공제 관련 납세자가 이긴 판례 알려줘",
    color: "#065f46",
  },
  TAXTR: {
    name: "조세심판 재결례",
    desc: "조세심판원 2,463건 재결례 — 유사 사건 전략 분석",
    placeholder: "예) 법인세 부당행위계산 부인 처분 관련 최근 재결 경향은?",
    color: "#92400e",
  },
  STRATEGY: {
    name: "불복전략 분석",
    desc: "사건 요약 → 유사 판례·재결례 검색 + 불복 전략 보고서",
    placeholder: "예) 이전가격 조작 혐의로 법인세 과세처분을 받았습니다. 국내 관계사 간 용역거래의 정상가격 산출방법 다툼입니다.",
    color: "#0f766e",
  },
  REBUTTAL: {
    name: "반론 초안 작성",
    desc: "과세처분 이유서 → 납세자 승소 판례 중심 반론 초안 생성",
    placeholder: "예) 과세관청은 원고가 세금계산서를 허위로 작성하여 부가가치세 매입세액을 부당하게 공제받았다고 판단하였습니다.",
    color: "#c2410c",
  },
  TREND: {
    name: "판례 트렌드 분석",
    desc: "특정 세법 쟁점의 연도별 판례 흐름·납세자 승소율 추이",
    placeholder: "예) 최근 10년간 이전가격 관련 법원 판례에서 납세자 승소 비율 추이",
    color: "#0369a1",
  },
  ITCL: {
    name: "국제조세 분석",
    desc: "국제조세조정법 관련 판례·법령 조문·Neo4j 쟁점 분석",
    placeholder: "예) 비교가능 제3자 가격법(CUP) 적용 시 국내외 거래 비교가능성 판단 기준은?",
    color: "#6d28d9",
  },
  RISK: {
    name: "개정법령 리스크",
    desc: "법령 개정 내용 → 기존 판례·재결례 영향 리스크 분석",
    placeholder: "법령명 (예: 국제조세조정에 관한 법률)",
    color: "#b91c1c",
  },
};

const AGENT_ORDER: AgentType[] = ["MULTI", "INSIGHT", "TAXLAW_PREC", "TAXTR", "STRATEGY", "REBUTTAL", "TREND", "ITCL", "RISK"];

const STEP_LABELS: Record<string, string> = {
  planned: "쿼리 분해",
  executed: "판례 검색",
  deep_insight: "심층 분석",
  reported: "보고서 생성",
  search_cases: "판례 검색",
  search_itcl_law: "법령 검색",
  synthesized: "결과 통합",
};

function getStepLabel(step: string) {
  if (step.startsWith("critic:")) return `검토 → ${step.slice(7)}`;
  return STEP_LABELS[step] ?? step;
}

function AgentSidebar() {
  const router = useRouter();
  const {
    agentType, setAgentType,
    query, setQuery,
    caseId, setCaseId,
    riskRevision, setRiskRevision,
    riskEffectiveDate, setRiskEffectiveDate,
    isRunning, result, steps,
    run, clear,
    setSidebarOpen,
  } = useAgentUI();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const agent = AGENT_LABELS[agentType];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      run();
    }
  };

  return (
    <aside style={{
      width: 300,
      minWidth: 300,
      borderRight: "1px solid #e5e7eb",
      backgroundColor: "#fafafa",
      padding: "16px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      height: "100vh",
      overflowY: "auto",
      position: "sticky",
      top: 0,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: 13, fontWeight: 700, color: AGENT_BLUE,
          letterSpacing: "0.05em", textTransform: "uppercase",
        }}>
          AI 법률 에이전트
        </span>
        <button
          onClick={() => setSidebarOpen(false)}
          style={{ fontSize: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}
          title="사이드바 닫기"
        >
          ✕
        </button>
      </div>

      {/* Agent Type */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          에이전트 선택
        </p>
        {AGENT_ORDER.map((type) => {
          const a = AGENT_LABELS[type];
          const active = agentType === type;
          return (
            <button
              key={type}
              onClick={() => { setAgentType(type); clear(); }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "9px 11px",
                marginBottom: 6,
                borderRadius: 8,
                border: `1px solid ${active ? a.color : "#e5e7eb"}`,
                background: active ? `${a.color}10` : "#fff",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: active ? a.color : "#d1d5db",
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: active ? a.color : "#374151" }}>
                  {a.name}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.4, paddingLeft: 14 }}>
                {a.desc}
              </div>
            </button>
          );
        })}
      </section>

      <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: 0 }} />

      {/* Query */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          질의
        </p>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={agent.placeholder}
          rows={5}
          style={{
            width: "100%",
            fontSize: 13,
            padding: "10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            resize: "vertical",
            lineHeight: 1.6,
            color: "#111827",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Ctrl + Enter로 실행</div>
      </section>

      {/* Case ID (InsightAgent only) */}
      {agentType === "INSIGHT" && (
        <section>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            사건번호 <span style={{ fontWeight: 400, textTransform: "none" }}>(선택)</span>
          </p>
          <input
            type="text"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            placeholder="예: 2022구합7106"
            style={{
              width: "100%",
              fontSize: 13,
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
            입력 시 해당 판례 심층 분석 포함
          </div>
        </section>
      )}

      {/* Risk extra fields */}
      {agentType === "RISK" && (
        <>
          <section>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              개정 내용
            </p>
            <textarea
              value={riskRevision}
              onChange={(e) => setRiskRevision(e.target.value)}
              placeholder="예) 제5조 제1항 — 정상가격 산출방법에 이익분할법을 추가하고 비교가능 제3자 가격법 우선순위를 변경"
              rows={4}
              style={{
                width: "100%",
                fontSize: 13,
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                resize: "vertical",
                lineHeight: 1.6,
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </section>
          <section>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              시행일 <span style={{ fontWeight: 400, textTransform: "none" }}>(선택)</span>
            </p>
            <input
              type="text"
              value={riskEffectiveDate}
              onChange={(e) => setRiskEffectiveDate(e.target.value)}
              placeholder="예: 2026-01-01"
              style={{
                width: "100%",
                fontSize: 13,
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </section>
        </>
      )}

      {/* Run Button */}
      <button
        onClick={run}
        disabled={!query.trim() || isRunning}
        style={{
          width: "100%",
          padding: "11px 0",
          borderRadius: 8,
          border: "none",
          background: !query.trim() || isRunning ? "#e5e7eb" : agent.color,
          color: !query.trim() || isRunning ? "#9ca3af" : "#fff",
          fontSize: 14,
          fontWeight: 700,
          cursor: !query.trim() || isRunning ? "default" : "pointer",
          letterSpacing: "0.02em",
          transition: "background 160ms ease",
        }}
      >
        {isRunning ? "분석 중…" : "에이전트 실행"}
      </button>

      {/* Steps Progress */}
      {(isRunning || steps.length > 0) && (
        <section>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            실행 단계
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#dbeafe", color: AGENT_BLUE,
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 12, color: "#374151" }}>{getStepLabel(s)}</span>
              </div>
            ))}
            {isRunning && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#fef3c7", color: "#d97706",
                  fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  ···
                </span>
                <span style={{ fontSize: 12, color: "#d97706" }}>처리 중</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Clear */}
      {result && (
        <button
          onClick={clear}
          style={{
            width: "100%",
            padding: "8px 0",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            fontSize: 13,
            color: "#6b7280",
            cursor: "pointer",
          }}
        >
          결과 초기화
        </button>
      )}

      {/* Nav */}
      <div style={{ marginTop: "auto", borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
        <div
          onClick={() => router.push("/")}
          style={{ fontSize: 12, color: "#9ca3af", cursor: "pointer" }}
        >
          ← 홈으로
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen, agentType } = useAgentUI();
  const agent = AGENT_LABELS[agentType];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      borderBottom: "1px solid #e5e7eb",
      background: "#fff",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          width: 30, height: 30, borderRadius: 8,
          border: "1px solid #d1d5db",
          background: AGENT_BLUE, color: "#fff",
          cursor: "pointer", fontSize: 16, fontWeight: 700,
        }}
        title="메뉴"
      >
        ☰
      </button>
      <div style={{ fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/")}>홈</span>
        <span style={{ color: "#9ca3af" }}>/</span>
        <span style={{ fontWeight: 600, color: agent.color }}>
          {agent.name}
        </span>
      </div>
    </div>
  );
}

function AgentShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useAgentUI();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {sidebarOpen && <AgentSidebar />}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed", top: 10, left: 16, zIndex: 1000,
            padding: "8px 10px", fontSize: 12, borderRadius: 8,
            border: "1px solid #d1d5db", background: "#fff",
            cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          ☰ 메뉴
        </button>
      )}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar />
        <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
      </main>
    </div>
  );
}

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentUIProvider>
      <AgentShell>{children}</AgentShell>
    </AgentUIProvider>
  );
}

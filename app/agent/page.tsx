"use client";

import { useState } from "react";
import { useAgentUI, InsightResult, MultiResult } from "./AgentUIContext";

const AGENT_BLUE = "#1e40af";

/* ─────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────── */

function SectionCard({
  title,
  defaultOpen = false,
  children,
  accent,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  accent?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "12px 16px",
          background: "#f9fafb",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 14,
          fontWeight: 700,
          color: accent ?? "#111827",
        }}
      >
        {title}
        <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 400 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div style={{ padding: "14px 16px", background: "#fff" }}>{children}</div>}
    </div>
  );
}

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      background: color ? `${color}18` : "#f3f4f6",
      color: color ?? "#374151",
      border: `1px solid ${color ? `${color}40` : "#e5e7eb"}`,
      marginRight: 4,
      marginBottom: 4,
    }}>
      {label}
    </span>
  );
}

function SimilarityBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <div style={{
        flex: 1, height: 4, borderRadius: 2, background: "#e5e7eb", overflow: "hidden",
      }}>
        <div style={{ height: "100%", width: `${pct}%`, background: AGENT_BLUE, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: "#6b7280", minWidth: 32 }}>{pct}%</span>
    </div>
  );
}

function ReportText({ text }: { text: string }) {
  return (
    <div style={{
      fontSize: 14,
      lineHeight: 1.85,
      color: "#1f2937",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      fontFamily: "var(--font-geist-sans), sans-serif",
    }}>
      {text}
    </div>
  );
}

/* ─────────────────────────────────────────
 * InsightAgent result view
 * ───────────────────────────────────────── */

function InsightResultView({ result }: { result: InsightResult }) {
  const exec = result.insight?.executive_summary;

  return (
    <div>
      {/* Final Report */}
      <SectionCard title="분석 보고서" defaultOpen accent={AGENT_BLUE}>
        <ReportText text={result.final_report} />
      </SectionCard>

      {/* Executive Summary */}
      {exec && (
        <SectionCard title="판결 요약" defaultOpen accent="#7c3aed">
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>핵심 결론</div>
            <div style={{ fontSize: 14, color: "#1f2937", lineHeight: 1.7 }}>{exec.one_liner}</div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>주요 쟁점</div>
            {exec.core_issues.map((issue, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <span style={{ color: "#7c3aed", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{issue}</span>
              </div>
            ))}
          </div>

          <SectionCard title="법원의 판단 논리">
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginBottom: 8 }}>
              {exec.judicial_logic.how_the_court_thought}
            </div>
            {exec.judicial_logic.legal_context.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {exec.judicial_logic.legal_context.map((ctx, i) => (
                  <Badge key={i} label={ctx} color="#7c3aed" />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="당사자 입장">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: AGENT_BLUE, marginBottom: 4 }}>납세자</div>
                <div style={{ fontSize: 13, color: "#1f2937", lineHeight: 1.6 }}>{exec.party_positions.taxpayer}</div>
              </div>
              <div style={{ background: "#fef2f2", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 4 }}>과세관청</div>
                <div style={{ fontSize: 13, color: "#1f2937", lineHeight: 1.6 }}>{exec.party_positions.tax_authority}</div>
              </div>
            </div>
            {exec.party_positions.contrasting_points.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>주요 대립 지점</div>
                {exec.party_positions.contrasting_points.map((p, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 4, paddingLeft: 8, borderLeft: "2px solid #e5e7eb" }}>
                    {p}
                  </div>
                ))}
              </>
            )}
          </SectionCard>

          <SectionCard title="리스크 전망">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: AGENT_BLUE, marginBottom: 4 }}>납세자 리스크</div>
                <div style={{ fontSize: 13, color: "#1f2937", lineHeight: 1.6 }}>{exec.risk_view.taxpayer_risk}</div>
              </div>
              <div style={{ background: "#fef2f2", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 4 }}>과세관청 리스크</div>
                <div style={{ fontSize: 13, color: "#1f2937", lineHeight: 1.6 }}>{exec.risk_view.tax_authority_risk}</div>
              </div>
            </div>
            <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", marginBottom: 4 }}>선례 시그널</div>
              <div style={{ fontSize: 13, color: "#1f2937", lineHeight: 1.6 }}>{exec.risk_view.precedent_signal}</div>
            </div>
          </SectionCard>
        </SectionCard>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
 * SupervisorAgent result view
 * ───────────────────────────────────────── */

function MultiResultView({ result }: { result: MultiResult }) {
  const searchResults = result.case_context?.search_results ?? [];
  const patternResult = result.case_context?.pattern_results;
  const relatedIssues = result.law_context?.related_issues ?? [];
  const articles = result.law_context?.articles ?? [];

  return (
    <div>
      {/* Tools used */}
      {result.tools_used?.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>사용 도구:</span>
          {result.tools_used.map((t) => (
            <Badge key={t} label={t} color={AGENT_BLUE} />
          ))}
        </div>
      )}

      {/* Final Report */}
      <SectionCard title="종합 분석 보고서" defaultOpen accent={AGENT_BLUE}>
        <ReportText text={result.final_report} />
      </SectionCard>

      {/* Case Search Results */}
      {searchResults.length > 0 && (
        <SectionCard title={`관련 판례 (${searchResults.length}건)`} defaultOpen>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {searchResults.map((c, i) => (
              <div key={i} style={{
                border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{c.case_number}</span>
                    {c.court_name && (
                      <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>{c.court_name}</span>
                    )}
                    {c.judgment_date && (
                      <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 6 }}>{c.judgment_date}</span>
                    )}
                  </div>
                  {c.conclusion && (
                    <Badge
                      label={c.conclusion}
                      color={c.conclusion.includes("기각") || c.conclusion.includes("패소") ? "#dc2626" : "#065f46"}
                    />
                  )}
                </div>
                {c.issue && (
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 4 }}>{c.issue}</div>
                )}
                {c.mini_conclusion && (
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginTop: 4 }}>{c.mini_conclusion}</div>
                )}
                {c.similarity != null && <SimilarityBar value={c.similarity} />}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Pattern Results */}
      {patternResult && (
        <SectionCard title="판례 패턴 분석">
          {patternResult.related_cases?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>연관 판례</div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {patternResult.related_cases.map((c, i) => <Badge key={i} label={c} />)}
              </div>
            </div>
          )}
          {patternResult.statutes_cited?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>인용 법령</div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {patternResult.statutes_cited.map((s, i) => <Badge key={i} label={s} color="#7c3aed" />)}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* Law Context */}
      {(relatedIssues.length > 0 || articles.length > 0) && (
        <SectionCard title="ITCL 법령 컨텍스트" defaultOpen>
          {relatedIssues.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>관련 쟁점</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {relatedIssues.map((issue, i) => (
                  <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{issue.issue_title}</span>
                      {issue.similarity != null && (
                        <span style={{ fontSize: 11, color: "#6b7280" }}>{Math.round(issue.similarity * 100)}%</span>
                      )}
                    </div>
                    {issue.issue_summary && (
                      <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>{issue.issue_summary}</div>
                    )}
                    {issue.similarity != null && <SimilarityBar value={issue.similarity} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {articles.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>관련 조문</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {articles.map((art, i) => (
                  <div key={i} style={{
                    background: "#f9fafb", borderRadius: 6, padding: "8px 10px",
                    borderLeft: "3px solid #7c3aed",
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{art.article_title}</span>
                    {art.scope && (
                      <span style={{ fontSize: 11, color: "#7c3aed", marginLeft: 8 }}>{art.scope}</span>
                    )}
                    {art.related_issue && (
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>쟁점: {art.related_issue}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
 * Empty / Loading states
 * ───────────────────────────────────────── */

function EmptyState({ agentType }: { agentType: "INSIGHT" | "MULTI" }) {
  return (
    <div style={{
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      padding: "40px 36px",
      maxWidth: 680,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: AGENT_BLUE, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
        {agentType === "MULTI" ? "종합 리서치 에이전트" : "판례 심층 분석 에이전트"}
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 12, lineHeight: 1.35 }}>
        {agentType === "MULTI"
          ? "판례 + 법령을 교차 분석합니다"
          : "판례 전략 보고서를 생성합니다"}
      </h2>
      <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.75, marginBottom: 24 }}>
        {agentType === "MULTI"
          ? "SupervisorAgent는 판례 DB와 ITCL 국제조세조정법 레이어를 동시에 탐색해 최적의 법령 컨텍스트와 관련 판례를 종합 보고서로 생성합니다."
          : "InsightAgent는 쿼리를 분해하고 관련 판례를 탐색한 뒤, 사건번호 입력 시 ExportC 심층 분석을 포함한 전략 보고서를 작성합니다."}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13, color: "#374151" }}>
        {(agentType === "MULTI"
          ? ["판례 벡터 검색", "ITCL 쟁점 매핑", "패턴 분석", "법령 조문 연계"]
          : ["쿼리 자동 분해", "판례 패턴 분석", "심층 논리 추출", "전략 보고서 생성"]
        ).map((item) => (
          <div key={item} style={{
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ color: AGENT_BLUE, fontSize: 14 }}>✓</span>
            {item}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px dashed #e5e7eb", fontSize: 13, color: "#9ca3af" }}>
        ← 왼쪽에서 질의를 입력하고 <strong style={{ color: "#374151" }}>에이전트 실행</strong>을 누르세요.
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      padding: "40px 36px",
      maxWidth: 480,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: `3px solid #dbeafe`,
        borderTopColor: AGENT_BLUE,
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 6 }}>에이전트가 분석 중입니다</div>
        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
          그래프 탐색과 LLM 추론이 순차적으로 실행됩니다.
          <br />완료까지 수십 초~수 분 소요될 수 있습니다.
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
 * Main Page
 * ───────────────────────────────────────── */

export default function AgentPage() {
  const { agentType, isRunning, result, error } = useAgentUI();

  return (
    <div style={{
      minHeight: "calc(100vh - 55px)",
      backgroundColor: "#f5f6f8",
      padding: "32px 40px 80px",
    }}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 16,
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            fontSize: 13,
            color: "#dc2626",
          }}>
            오류: {error}
          </div>
        )}

        {/* Loading */}
        {isRunning && !result && <LoadingState />}

        {/* Result */}
        {!isRunning && result && (
          <>
            {/* Query echo */}
            <div style={{
              marginBottom: 16,
              padding: "10px 14px",
              background: "#eff6ff",
              borderRadius: 8,
              border: "1px solid #bfdbfe",
              fontSize: 13,
              color: "#1e40af",
              lineHeight: 1.5,
            }}>
              <strong>Q.</strong> {result.query}
            </div>

            {"steps" in result && (result as InsightResult).steps?.length > 0 ? (
              <InsightResultView result={result as InsightResult} />
            ) : (
              <MultiResultView result={result as MultiResult} />
            )}
          </>
        )}

        {/* Empty state */}
        {!isRunning && !result && !error && <EmptyState agentType={agentType} />}
      </div>
    </div>
  );
}

"use client";

import { useState, KeyboardEvent } from "react";
import Link from "next/link";
import {
  useAgentUI,
  InsightResult, MultiResult, TaxlawPrecResult, TaxtrResult,
  StrategyResult, RebuttalResult, TrendResult, ITCLResult, RiskResult,
  CourtCase, TaxtrCase, LawArticle,
  AgentType,
} from "./AgentUIContext";

const AGENT_BLUE = "#1e40af";

/* ─────────────────────────────────────────
 * Agent config
 * ───────────────────────────────────────── */

const AGENT_LABELS: Record<AgentType, { name: string; color: string; placeholder: string }> = {
  MULTI:       { name: "종합 리서치",     color: "#1e40af", placeholder: "예) 이전가격 과소신고 관련 판례와 세법 조문을 종합 분석해줘" },
  INSIGHT:     { name: "판례 심층 분석",  color: "#7c3aed", placeholder: "예) 부당행위계산부인 적용 기준에 관한 판례 전략 보고서를 작성해줘" },
  TAXLAW_PREC: { name: "법원 판례 검색",  color: "#065f46", placeholder: "예) 명의신탁 증여세 과세처분 관련 법원 판례를 찾아줘" },
  TAXTR:       { name: "조세심판 재결례", color: "#92400e", placeholder: "예) 경비 부인 처분에 대한 조세심판 재결례를 분석해줘" },
  STRATEGY:    { name: "불복전략 분석",   color: "#0f766e", placeholder: "예) 이전가격 과세처분을 받았습니다. 불복 전략을 분석해줘" },
  REBUTTAL:    { name: "반론 초안 작성",  color: "#c2410c", placeholder: "과세처분 이유서를 붙여넣으면 납세자 승소 판례 기반 반론 초안을 작성합니다" },
  TREND:       { name: "판례 트렌드",     color: "#0369a1", placeholder: "예) 최근 5년간 부가세 매입세액 공제 거부 판례 트렌드를 분석해줘" },
  ITCL:        { name: "국제조세 분석",   color: "#6d28d9", placeholder: "예) GLOBE 필라2 세액공제 관련 국제조세 판례와 법령을 분석해줘" },
  RISK:        { name: "개정법령 리스크",  color: "#b91c1c", placeholder: "법령명을 입력하세요 (예: 조세특례제한법)" },
};

const AGENT_ORDER: AgentType[] = [
  "MULTI", "INSIGHT", "TAXLAW_PREC", "TAXTR",
  "STRATEGY", "REBUTTAL", "TREND", "ITCL", "RISK",
];

const STEP_LABELS: Record<string, string> = {
  planned:        "쿼리 분해",
  executed:       "판례 검색",
  deep_insight:   "심층 분석",
  reported:       "보고서 생성",
  search_cases:   "판례 검색",
  search_itcl_law:"법령 검색",
  synthesized:    "결과 통합",
};

/* ─────────────────────────────────────────
 * Shared helpers
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
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#e5e7eb", overflow: "hidden" }}>
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
      <SectionCard title="분석 보고서" defaultOpen accent={AGENT_BLUE}>
        <ReportText text={result.final_report} />
      </SectionCard>

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

      {(result.law_articles_context ?? []).length > 0 && (
        <SectionCard title={`관련 세법 조문 (${result.law_articles_context!.length}건)`} accent="#059669">
          {result.law_articles_context!.map((a, i) => {
            const scopeLabel: Record<string,string> = { law: "법", decree: "시행령", rule: "시행규칙" };
            return (
              <div key={i} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, background: "#d1fae5", color: "#065f46", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>
                    {a.scope ? (scopeLabel[a.scope] ?? a.scope) : ""}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>{a.law_name}</span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{a.article_no}</span>
                  {a.title && <span style={{ fontSize: 12, color: "#374151" }}>{a.title}</span>}
                </div>
                <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {a.document?.slice(0, 300)}{(a.document?.length ?? 0) > 300 ? "…" : ""}
                </div>
              </div>
            );
          })}
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
  const lawArticles = result.law_articles_context ?? [];
  const precResults = result.taxlaw_prec_context ?? [];
  const taxtrResults = result.taxtr_context ?? [];

  return (
    <div>
      {result.tools_used?.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>사용 도구:</span>
          {result.tools_used.map((t) => (
            <Badge key={t} label={t} color={AGENT_BLUE} />
          ))}
        </div>
      )}

      <SectionCard title="종합 분석 보고서" defaultOpen accent={AGENT_BLUE}>
        <ReportText text={result.final_report} />
      </SectionCard>

      {searchResults.length > 0 && (
        <SectionCard title={`관련 판례 (${searchResults.length}건)`} defaultOpen>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {searchResults.map((c, i) => (
              <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{c.case_number}</span>
                    {c.court_name && <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>{c.court_name}</span>}
                    {c.judgment_date && <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 6 }}>{c.judgment_date}</span>}
                  </div>
                  {c.conclusion && (
                    <Badge label={c.conclusion} color={c.conclusion.includes("기각") || c.conclusion.includes("패소") ? "#dc2626" : "#065f46"} />
                  )}
                </div>
                {c.issue && <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 4 }}>{c.issue}</div>}
                {c.mini_conclusion && <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginTop: 4 }}>{c.mini_conclusion}</div>}
                {c.similarity != null && <SimilarityBar value={c.similarity} />}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {precResults.length > 0 && (
        <SectionCard title={`NTS 법원 판례 (${precResults.length}건)`} defaultOpen>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {precResults.map((p, i) => (
              <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{p.case_no || p.doc_id}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {p.tax_type && <Badge label={p.tax_type} color="#065f46" />}
                    {p.decision && (
                      <Badge
                        label={p.decision}
                        color={p.decision.includes("국패") ? "#065f46" : "#dc2626"}
                      />
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
                  {p.title || p.document?.slice(0, 100)}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {taxtrResults.length > 0 && (
        <SectionCard title={`조세심판 재결례 (${taxtrResults.length}건)`} defaultOpen>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {taxtrResults.map((t, i) => {
              const caseNo = t.case_no || t.dem_no || t.doc_id || "";
              const decisionLabel = t.decision_type || t.decision || "";
              return (
                <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{caseNo}</span>
                    {decisionLabel && <Badge label={decisionLabel} color="#92400e" />}
                  </div>
                  <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
                    {t.title || t.document?.slice(0, 100)}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

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

      {lawArticles.length > 0 && (
        <SectionCard title={`세법 조문 (${lawArticles.length}건)`} defaultOpen>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {lawArticles.map((art, i) => {
              const scopeLabel: Record<string, string> = { LAW: "법", DECREE: "시행령", RULE: "시행규칙" };
              const scopeColor: Record<string, string> = { LAW: "#1e40af", DECREE: "#065f46", RULE: "#92400e" };
              const scopeKey = art.scope ?? "";
              const sl = scopeLabel[scopeKey] ?? scopeKey;
              const sc = scopeColor[scopeKey] ?? "#6b7280";
              return (
                <div key={i} style={{ background: "#f9fafb", borderRadius: 6, padding: "8px 12px", borderLeft: `3px solid ${sc}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                      {art.law_name} 제{art.article_no}조 {art.title}
                    </span>
                    <span style={{ fontSize: 11, color: sc, background: `${sc}18`, padding: "1px 6px", borderRadius: 10 }}>{sl}</span>
                    {art.domain && <span style={{ fontSize: 11, color: "#6b7280" }}>[{art.domain}]</span>}
                  </div>
                  {art.document && <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>{art.document.slice(0, 200)}</div>}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
 * Simple answer view (TAXLAW_PREC / TAXTR)
 * ───────────────────────────────────────── */

function SimpleAnswerView({
  result,
  accentColor,
  label,
}: {
  result: TaxlawPrecResult | TaxtrResult;
  accentColor: string;
  label: string;
}) {
  return (
    <div>
      <div style={{
        marginBottom: 12,
        padding: "10px 14px",
        background: `${accentColor}0d`,
        borderRadius: 8,
        border: `1px solid ${accentColor}30`,
        fontSize: 12,
        fontWeight: 600,
        color: accentColor,
        letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
      }}>
        {label}
      </div>
      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "20px 22px",
        fontSize: 14,
        lineHeight: 1.9,
        color: "#1f2937",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}>
        {result.answer}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
 * Shared result section helpers
 * ───────────────────────────────────────── */

function CourtCasesSection({ cases, title }: { cases: CourtCase[]; title: string }) {
  if (!cases || cases.length === 0) return null;
  return (
    <SectionCard title={`${title} (${cases.length}건)`} defaultOpen>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cases.map((c, i) => (
          <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{c.case_no || c.doc_id}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {c.attr_yr && <Badge label={c.attr_yr} />}
                {c.tax_type && <Badge label={c.tax_type} color="#065f46" />}
                {c.decision && (
                  <Badge
                    label={c.decision}
                    color={c.decision.includes("국패") || c.decision.includes("취소") ? "#065f46" : "#dc2626"}
                  />
                )}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
              {c.title || c.document?.slice(0, 120)}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function TaxtrCasesSection({ cases, title }: { cases: TaxtrCase[]; title: string }) {
  if (!cases || cases.length === 0) return null;
  return (
    <SectionCard title={`${title} (${cases.length}건)`} defaultOpen>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cases.map((t, i) => {
          const caseNo = t.case_no || t.dem_no || t.doc_id || "";
          const decisionLabel = t.decision_type || t.decision || "";
          const favorable = ["인용","취소","감액"].some(k => decisionLabel.includes(k));
          return (
            <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{caseNo}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {t.tax_type && <Badge label={t.tax_type} />}
                  {decisionLabel && <Badge label={decisionLabel} color={favorable ? "#065f46" : "#92400e"} />}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
                {t.title || t.document?.slice(0, 120)}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function LawArticlesSection({ articles, title }: { articles: LawArticle[]; title: string }) {
  if (!articles || articles.length === 0) return null;
  return (
    <SectionCard title={`${title} (${articles.length}건)`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {articles.map((art, i) => {
          const SCOPE_LABEL: Record<string, string> = { LAW: "법", DECREE: "시행령", RULE: "시행규칙", law: "법", decree: "시행령", rule: "시행규칙" };
          const SCOPE_COLOR: Record<string, string> = { LAW: "#1e40af", DECREE: "#065f46", RULE: "#92400e", law: "#1e40af", decree: "#065f46", rule: "#92400e" };
          const scopeKey = art.scope ?? "";
          const sl = SCOPE_LABEL[scopeKey] ?? scopeKey;
          const sc = SCOPE_COLOR[scopeKey] ?? "#6b7280";
          return (
            <div key={i} style={{ background: "#f9fafb", borderRadius: 6, padding: "8px 12px", borderLeft: `3px solid ${sc}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                  {art.law_name} 제{art.article_no}조 {art.title}
                </span>
                <span style={{ fontSize: 11, color: sc, background: `${sc}18`, padding: "1px 6px", borderRadius: 10 }}>{sl}</span>
                {art.domain && <span style={{ fontSize: 11, color: "#6b7280" }}>[{art.domain}]</span>}
              </div>
              {art.document && <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>{art.document.slice(0, 200)}</div>}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* ─────────────────────────────────────────
 * Agent-specific result views
 * ───────────────────────────────────────── */

function StrategyResultView({ result }: { result: StrategyResult }) {
  return (
    <div>
      <SectionCard title="불복전략 보고서" defaultOpen accent="#0f766e">
        <ReportText text={result.final_report} />
      </SectionCard>
      <CourtCasesSection cases={result.court_cases ?? []} title="관련 법원 판례" />
      <TaxtrCasesSection cases={result.taxtr_cases ?? []} title="관련 조세심판 재결례" />
      <LawArticlesSection articles={result.law_articles ?? []} title="관련 세법 조문" />
    </div>
  );
}

function RebuttalResultView({ result }: { result: RebuttalResult }) {
  return (
    <div>
      <SectionCard title="반론 초안" defaultOpen accent="#c2410c">
        <ReportText text={result.final_report} />
      </SectionCard>
      <CourtCasesSection cases={result.winning_court_cases ?? []} title="납세자 승소 판례" />
      <TaxtrCasesSection cases={result.favorable_taxtr_cases ?? []} title="인용·취소 재결례" />
      <LawArticlesSection articles={result.law_articles ?? []} title="관련 세법 조문" />
    </div>
  );
}

function TrendResultView({ result }: { result: TrendResult }) {
  const yearStats = result.trend_data?.year_stats ?? {};
  const sortedYears = Object.keys(yearStats).sort((a, b) => Number(a) - Number(b));

  return (
    <div>
      <SectionCard title="판례 트렌드 분석 보고서" defaultOpen accent="#0369a1">
        <ReportText text={result.final_report} />
      </SectionCard>

      {sortedYears.length > 0 && (
        <SectionCard title={`연도별 통계 (총 ${result.trend_data?.total_cases ?? 0}건)`} defaultOpen accent="#0369a1">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  {["연도", "총건수", "납세자 승소", "승소율"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "center", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedYears.map((yr) => {
                  const s = yearStats[yr];
                  const winPct = Math.round((s.win_rate ?? 0) * 100);
                  return (
                    <tr key={yr} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "7px 12px", textAlign: "center", fontWeight: 600, color: "#0369a1" }}>{yr}</td>
                      <td style={{ padding: "7px 12px", textAlign: "center", color: "#374151" }}>{s.total}</td>
                      <td style={{ padding: "7px 12px", textAlign: "center", color: "#065f46" }}>{s.taxpayer_win}</td>
                      <td style={{ padding: "7px 12px", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                          <div style={{ width: 60, height: 6, borderRadius: 3, background: "#e5e7eb", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${winPct}%`, background: "#0369a1", borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, color: "#374151" }}>{winPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {(result.trend_data?.sample ?? []).length > 0 && (
        <CourtCasesSection cases={result.trend_data!.sample!} title="대표 판례 샘플" />
      )}
      <TaxtrCasesSection cases={result.taxtr_sample ?? []} title="조세심판 참고 사례" />
    </div>
  );
}

function ITCLResultView({ result }: { result: ITCLResult }) {
  const itclIssues = result.itcl_issues ?? [];

  return (
    <div>
      <SectionCard title="국제조세 분석 보고서" defaultOpen accent="#6d28d9">
        <ReportText text={result.final_report} />
      </SectionCard>
      <CourtCasesSection cases={result.court_cases ?? []} title="관련 법원 판례" />
      <LawArticlesSection articles={result.law_articles ?? []} title="국제조세조정법 조문" />
      {itclIssues.length > 0 && (
        <SectionCard title={`ITCL 쟁점 분석 (${itclIssues.length}건)`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {itclIssues.map((issue: any, i: number) => (
              <div key={i} style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#6d28d9", marginBottom: 4 }}>
                  {issue.title ?? issue.issue ?? `쟁점 ${i + 1}`}
                </div>
                <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
                  {typeof issue === "string" ? issue : issue.description ?? issue.content ?? JSON.stringify(issue).slice(0, 200)}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function RiskResultView({ result }: { result: RiskResult }) {
  return (
    <div>
      <SectionCard title="법령 개정 리스크 분석 보고서" defaultOpen accent="#b91c1c">
        <ReportText text={result.final_report} />
      </SectionCard>
      <CourtCasesSection cases={result.affected_court_cases ?? []} title="영향받는 법원 판례" />
      <TaxtrCasesSection cases={result.affected_taxtr_cases ?? []} title="영향받는 조세심판 재결례" />
      <LawArticlesSection articles={result.revised_articles ?? []} title="개정 대상 조문" />
    </div>
  );
}

/* ─────────────────────────────────────────
 * Main Page — full-screen search UI
 * ───────────────────────────────────────── */

export default function AgentPage() {
  const {
    agentType, setAgentType,
    query, setQuery,
    caseId, setCaseId,
    riskRevision, setRiskRevision,
    riskEffectiveDate, setRiskEffectiveDate,
    isRunning, result, steps, error,
    run, clear,
  } = useAgentUI();

  const [chipHover, setChipHover] = useState<AgentType | null>(null);

  const color = AGENT_LABELS[agentType].color;
  const isIdle = !isRunning && !result && !error;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isRunning && query.trim()) run();
    }
  };

  const handleAgentSwitch = (type: AgentType) => {
    setAgentType(type);
    clear();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6f8", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
      `}</style>

      {/* ── Top Nav ── */}
      <nav style={{
        height: 52,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 20,
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        <Link href="/" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", color: "#111827", textDecoration: "none" }}>
          LAPIS NEXUS
        </Link>
        <div style={{ width: 1, height: 16, background: "#e5e7eb" }} />
        <Link href="/enter" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
          ← 에이전트 선택
        </Link>
        {result && (
          <>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => { clear(); setQuery(""); }}
              style={{
                fontSize: 12,
                color: "#6b7280",
                background: "none",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "5px 12px",
                cursor: "pointer",
              }}
            >
              새 질의
            </button>
          </>
        )}
      </nav>

      {/* ── Content area ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px 80px",
      }}>

        {/* Input panel — centered when idle, near top when active */}
        <div style={{
          width: "100%",
          maxWidth: 760,
          marginTop: isIdle ? "clamp(60px, 18vh, 160px)" : 32,
          marginBottom: 28,
          transition: "margin-top 0.2s ease",
        }}>

          {/* Heading (idle only) */}
          {isIdle && (
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.22em", color: "#9ca3af", textTransform: "uppercase", marginBottom: 10 }}>
                LAPIS NEXUS
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 600, color: "#111827", margin: "0 0 8px", lineHeight: 1.3 }}>
                세법 AI 에이전트
              </h1>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
                에이전트를 선택하고 질의를 입력하세요. Enter로 실행합니다.
              </p>
            </div>
          )}

          {/* Agent chip row */}
          <div style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 6,
            marginBottom: 12,
            scrollbarWidth: "thin" as const,
          }}>
            {AGENT_ORDER.map((type) => {
              const active = agentType === type;
              const hov = chipHover === type;
              const c = AGENT_LABELS[type].color;
              return (
                <button
                  key={type}
                  onClick={() => handleAgentSwitch(type)}
                  onMouseEnter={() => setChipHover(type)}
                  onMouseLeave={() => setChipHover(null)}
                  style={{
                    flexShrink: 0,
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: `1.5px solid ${active ? c : hov ? c + "80" : "#e5e7eb"}`,
                    background: active ? c : hov ? c + "10" : "#fff",
                    color: active ? "#fff" : hov ? c : "#374151",
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {AGENT_LABELS[type].name}
                </button>
              );
            })}
          </div>

          {/* Textarea container */}
          <div style={{
            position: "relative",
            background: "#fff",
            border: `2px solid ${isRunning ? color : "#e5e7eb"}`,
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            transition: "border-color 0.2s ease",
          }}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={AGENT_LABELS[agentType].placeholder}
              rows={isIdle ? 4 : 3}
              disabled={isRunning}
              style={{
                width: "100%",
                padding: "16px 56px 16px 18px",
                border: "none",
                borderRadius: 14,
                resize: "none",
                fontSize: 14,
                lineHeight: 1.65,
                color: "#111827",
                background: "transparent",
                outline: "none",
                fontFamily: "var(--font-geist-sans), sans-serif",
                boxSizing: "border-box" as const,
              }}
            />
            {/* Submit button */}
            <button
              onClick={() => run()}
              disabled={isRunning || !query.trim()}
              style={{
                position: "absolute",
                right: 12,
                bottom: 12,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: !isRunning && query.trim() ? color : "#e5e7eb",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: !isRunning && query.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s ease",
                lineHeight: 1,
              }}
            >
              {isRunning ? (
                <span style={{
                  display: "block",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                  animation: "spin 0.7s linear infinite",
                }} />
              ) : "↑"}
            </button>
          </div>

          {/* INSIGHT extra: case ID */}
          {agentType === "INSIGHT" && (
            <div style={{ marginTop: 8 }}>
              <input
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="사건번호 (선택 사항, 예: 2024구합12345) — 입력 시 해당 판결 심층 분석 포함"
                disabled={isRunning}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#374151",
                  background: "#fff",
                  outline: "none",
                  boxSizing: "border-box" as const,
                  fontFamily: "var(--font-geist-sans), sans-serif",
                }}
              />
            </div>
          )}

          {/* RISK extra: revision summary + effective date */}
          {agentType === "RISK" && (
            <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
              <textarea
                value={riskRevision}
                onChange={(e) => setRiskRevision(e.target.value)}
                placeholder="개정 내용 요약 (예: 제15조 외국납부세액공제 한도 축소 — 기존 100% → 80%로 변경)"
                rows={2}
                disabled={isRunning}
                style={{
                  padding: "10px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#374151",
                  background: "#fff",
                  outline: "none",
                  resize: "none",
                  fontFamily: "var(--font-geist-sans), sans-serif",
                }}
              />
              <input
                value={riskEffectiveDate}
                onChange={(e) => setRiskEffectiveDate(e.target.value)}
                placeholder="시행일 (예: 2025-01-01)"
                disabled={isRunning}
                style={{
                  padding: "10px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#374151",
                  background: "#fff",
                  outline: "none",
                  fontFamily: "var(--font-geist-sans), sans-serif",
                }}
              />
            </div>
          )}

          {/* Loading indicator */}
          {isRunning && (
            <div style={{
              marginTop: 14,
              padding: "12px 16px",
              background: `${color}08`,
              border: `1px solid ${color}20`,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: `2.5px solid ${color}30`,
                borderTopColor: color,
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 2 }}>
                  {AGENT_LABELS[agentType].name} 에이전트가 분석 중입니다
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  검색 → LLM 추론 → 보고서 생성 순서로 진행됩니다. 수십 초~수 분 소요.
                </div>
              </div>
            </div>
          )}

          {/* Completed steps */}
          {steps.length > 0 && !isRunning && (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {steps.map((s, i) => (
                <span key={i} style={{
                  fontSize: 11,
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: `${color}12`,
                  color,
                  border: `1px solid ${color}30`,
                  fontWeight: 600,
                }}>
                  ✓ {STEP_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 10,
              padding: "10px 14px",
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              fontSize: 13,
              color: "#dc2626",
            }}>
              오류: {error}
            </div>
          )}
        </div>

        {/* ── Results ── */}
        {result && !isRunning && (
          <div style={{ width: "100%", maxWidth: 760 }}>
            {/* Query echo */}
            <div style={{
              marginBottom: 16,
              padding: "10px 14px",
              background: `${color}0c`,
              borderRadius: 10,
              border: `1px solid ${color}25`,
              fontSize: 13,
              color: "#374151",
              lineHeight: 1.5,
            }}>
              <span style={{ fontWeight: 700, color }}>Q. </span>
              {result.query}
              {agentType === "RISK" && riskRevision && (
                <span style={{ display: "block", marginTop: 4, fontSize: 12, color: "#6b7280" }}>
                  개정 내용: {riskRevision}
                  {riskEffectiveDate && ` / 시행일: ${riskEffectiveDate}`}
                </span>
              )}
            </div>

            {/* Result views */}
            {agentType === "INSIGHT" ? (
              <InsightResultView result={result as InsightResult} />
            ) : agentType === "MULTI" ? (
              <MultiResultView result={result as MultiResult} />
            ) : agentType === "TAXLAW_PREC" ? (
              <SimpleAnswerView result={result as TaxlawPrecResult} accentColor={color} label="법원 판례 에이전트 답변" />
            ) : agentType === "TAXTR" ? (
              <SimpleAnswerView result={result as TaxtrResult} accentColor={color} label="조세심판 재결례 에이전트 답변" />
            ) : agentType === "STRATEGY" ? (
              <StrategyResultView result={result as StrategyResult} />
            ) : agentType === "REBUTTAL" ? (
              <RebuttalResultView result={result as RebuttalResult} />
            ) : agentType === "TREND" ? (
              <TrendResultView result={result as TrendResult} />
            ) : agentType === "ITCL" ? (
              <ITCLResultView result={result as ITCLResult} />
            ) : (
              <RiskResultView result={result as RiskResult} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

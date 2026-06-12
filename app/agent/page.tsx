"use client";

import { useState } from "react";
import {
  useAgentUI,
  InsightResult, MultiResult, TaxlawPrecResult, TaxtrResult,
  StrategyResult, RebuttalResult, TrendResult, ITCLResult, RiskResult,
  CourtCase, TaxtrCase, LawArticle,
  AgentType,
} from "./AgentUIContext";

const AGENT_BLUE = "#1e40af";

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
            {taxtrResults.map((t, i) => (
              <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{t.dem_no || t.doc_id}</span>
                  {t.decision_type && <Badge label={t.decision_type} color="#92400e" />}
                </div>
                <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
                  {t.title || t.document?.slice(0, 100)}
                </div>
              </div>
            ))}
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
        {cases.map((t, i) => (
          <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{t.dem_no || t.doc_id}</span>
              {t.decision_type && (
                <Badge
                  label={t.decision_type}
                  color={["인용","취소","감액"].some(k => t.decision_type?.includes(k)) ? "#065f46" : "#92400e"}
                />
              )}
            </div>
            <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
              {t.title || t.document?.slice(0, 120)}
            </div>
          </div>
        ))}
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
 * StrategyAgent result view
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

/* ─────────────────────────────────────────
 * RebuttalAgent result view
 * ───────────────────────────────────────── */

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

/* ─────────────────────────────────────────
 * TrendAgent result view
 * ───────────────────────────────────────── */

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

/* ─────────────────────────────────────────
 * ITCLAgent result view
 * ───────────────────────────────────────── */

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

/* ─────────────────────────────────────────
 * RiskAgent result view
 * ───────────────────────────────────────── */

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
 * Empty / Loading states
 * ───────────────────────────────────────── */

const EMPTY_CONTENT: Record<AgentType, { title: string; desc: string; chips: string[]; color: string }> = {
  MULTI: {
    title: "판례 + 법령을 교차 분석합니다",
    desc: "SupervisorAgent는 판례 DB와 ITCL 국제조세조정법 레이어를 동시에 탐색해 최적의 법령 컨텍스트와 관련 판례를 종합 보고서로 생성합니다.",
    chips: ["판례 벡터 검색", "ITCL 쟁점 매핑", "패턴 분석", "법령 조문 연계"],
    color: "#1e40af",
  },
  INSIGHT: {
    title: "판례 전략 보고서를 생성합니다",
    desc: "InsightAgent는 쿼리를 분해하고 관련 판례를 탐색한 뒤, 사건번호 입력 시 ExportC 심층 분석을 포함한 전략 보고서를 작성합니다.",
    chips: ["쿼리 자동 분해", "판례 패턴 분석", "심층 논리 추출", "전략 보고서 생성"],
    color: "#7c3aed",
  },
  TAXLAW_PREC: {
    title: "32,000+ 법원 판례를 검색합니다",
    desc: "국세청 taxlaw.nts.go.kr에서 수집한 32,628건의 세법 법원 판례에서 질문과 관련된 판례를 찾아 분석합니다. 국승/국패 분류, 세법 유형별 필터를 지원합니다.",
    chips: ["국승/국패 분류", "세법 유형 필터", "요지 기반 검색", "트렌드 분석"],
    color: "#065f46",
  },
  TAXTR: {
    title: "조세심판원 재결례를 분석합니다",
    desc: "조세심판원 2,463건의 재결례 DB에서 유사 사건을 검색하고, 승소 전략과 결정 패턴을 분석합니다.",
    chips: ["재결례 벡터 검색", "승소 전략 분석", "결정 패턴", "세법 유형별"],
    color: "#92400e",
  },
  STRATEGY: {
    title: "유사 판례 기반 불복전략을 분석합니다",
    desc: "사건 개요를 입력하면 32,628건 법원 판례·2,463건 재결례에서 유사 사례를 찾아 구체적인 불복전략 보고서를 생성합니다.",
    chips: ["유사 사건 검색", "판례·재결례 교차 분석", "불복전략 도출", "세법 조문 연계"],
    color: "#0f766e",
  },
  REBUTTAL: {
    title: "납세자 승소 판례 기반 반론을 작성합니다",
    desc: "과세처분 이유서를 붙여넣으면 납세자 승소 판례와 인용 재결례만 필터링해 반론 초안을 자동 생성합니다.",
    chips: ["승소 판례 필터링", "인용 재결례 검색", "반론 초안 생성", "자기 검토(Reflection)"],
    color: "#c2410c",
  },
  TREND: {
    title: "연도별 판례 트렌드를 분석합니다",
    desc: "쟁점을 입력하면 관련 법원 판례의 연도별 건수·납세자 승소율을 집계하고, 최근 판례 흐름 해설 보고서를 생성합니다.",
    chips: ["연도별 승소율 통계", "판례 흐름 분석", "최근 트렌드 해설", "조세심판 비교"],
    color: "#0369a1",
  },
  ITCL: {
    title: "국제조세 판례·법령을 분석합니다",
    desc: "국제조세조정법 관련 쟁점을 입력하면 관련 판례, 법령 조문, Neo4j 그래프 쟁점을 통합 분석한 보고서를 생성합니다.",
    chips: ["이전가격 판례 검색", "ITCL 법령 조문", "Neo4j 쟁점 그래프", "통합 분석 보고서"],
    color: "#6d28d9",
  },
  RISK: {
    title: "법령 개정의 판례 영향을 분석합니다",
    desc: "법령명과 개정 내용을 입력하면 기존 법원 판례·재결례 중 영향받는 사건을 식별하고 리스크 보고서를 생성합니다.",
    chips: ["영향 판례 식별", "재결례 리스크 분석", "개정 조문 매핑", "시행일 기준 필터"],
    color: "#b91c1c",
  },
};

function EmptyState({ agentType }: { agentType: AgentType }) {
  const c = EMPTY_CONTENT[agentType];
  return (
    <div style={{
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      padding: "40px 36px",
      maxWidth: 680,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: c.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
        AI 에이전트
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 12, lineHeight: 1.35 }}>
        {c.title}
      </h2>
      <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.75, marginBottom: 24 }}>
        {c.desc}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13, color: "#374151" }}>
        {c.chips.map((item) => (
          <div key={item} style={{
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ color: c.color, fontSize: 14 }}>✓</span>
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

function LoadingState({ color }: { color: string }) {
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
        border: `3px solid #e5e7eb`,
        borderTopColor: color,
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 6 }}>에이전트가 분석 중입니다</div>
        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
          검색과 LLM 추론이 순차적으로 실행됩니다.
          <br />완료까지 수십 초~수 분 소요될 수 있습니다.
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
 * Main Page
 * ───────────────────────────────────────── */

const AGENT_COLORS: Record<AgentType, string> = {
  MULTI: "#1e40af",
  INSIGHT: "#7c3aed",
  TAXLAW_PREC: "#065f46",
  TAXTR: "#92400e",
  STRATEGY: "#0f766e",
  REBUTTAL: "#c2410c",
  TREND: "#0369a1",
  ITCL: "#6d28d9",
  RISK: "#b91c1c",
};

export default function AgentPage() {
  const { agentType, isRunning, result, error } = useAgentUI();
  const color = AGENT_COLORS[agentType];

  return (
    <div style={{
      minHeight: "calc(100vh - 55px)",
      backgroundColor: "#f5f6f8",
      padding: "32px 40px 80px",
    }}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
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

        {isRunning && !result && <LoadingState color={color} />}

        {!isRunning && result && (
          <>
            <div style={{
              marginBottom: 16,
              padding: "10px 14px",
              background: `${color}10`,
              borderRadius: 8,
              border: `1px solid ${color}30`,
              fontSize: 13,
              color: color,
              lineHeight: 1.5,
            }}>
              <strong>Q.</strong> {result.query}
            </div>

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
          </>
        )}

        {!isRunning && !result && !error && <EmptyState agentType={agentType} />}
      </div>
    </div>
  );
}

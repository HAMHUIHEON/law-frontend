"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://law-backend-production-5249.up.railway.app";

export type AgentType =
  | "INSIGHT" | "MULTI" | "TAXLAW_PREC" | "TAXTR"
  | "STRATEGY" | "REBUTTAL" | "TREND" | "ITCL" | "RISK";

/* ── shared sub-types ── */
export type CourtCase = {
  doc_id: string;
  case_no?: string;
  tax_type?: string;
  decision?: string;
  title?: string;
  attr_yr?: string;
  document?: string;
};

export type TaxtrCase = {
  doc_id?: string;
  case_no?: string;
  dem_no?: string;
  decision?: string;
  decision_type?: string;
  tax_type?: string;
  title?: string;
  document?: string;
};

export type LawArticle = {
  doc_id: string;
  law_name?: string;
  scope?: string;
  article_no?: string;
  title?: string;
  domain?: string;
  document?: string;
};

/* ── result types ── */

export interface InsightResult {
  query: string;
  final_report: string;
  insight: {
    executive_summary: {
      one_liner: string;
      core_issues: string[];
      judicial_logic: { how_the_court_thought: string; legal_context: string[] };
      party_positions: { taxpayer: string; tax_authority: string; contrasting_points: string[] };
      risk_view: { taxpayer_risk: string; tax_authority_risk: string; precedent_signal: string };
    };
  } | null;
  law_articles_context?: LawArticle[];
  steps: string[];
}

export interface PdfCaseResult {
  case_id: string;
  court?: string;
  case_no?: string;
  tax_type?: string;
  text_source?: string;
  document?: string;
  similarity?: number;
}

export interface IssueCacheResult {
  case_id: string;
  core_issue?: string;
  mini_conclusion?: string;
  statutes?: string[];
  score?: number;
}

export interface InquiryCase {
  doc_id?: string;
  doc_no?: string;
  tax_type?: string;
  reply_date?: string;
  title?: string;
  document?: string;
  similarity?: number;
}

export interface MultiResult {
  query: string;
  final_report: string;
  case_context: {
    search_results: {
      case_id: string;
      case_number: string;
      court_name: string;
      judgment_date: string;
      conclusion: string;
      issue: string;
      mini_conclusion: string;
      similarity: number;
    }[];
    pattern_results: { query: string; related_cases: string[]; statutes_cited: string[] };
  };
  taxlaw_prec_context?: CourtCase[];
  taxtr_context?: TaxtrCase[];
  inquiry_cases_context?: InquiryCase[];
  law_articles_context?: LawArticle[];
  pdf_cases_context?: PdfCaseResult[];
  issue_cache_context?: IssueCacheResult[];
  tools_used: string[];
}

export interface TaxlawPrecResult {
  query: string;
  question: string;
  answer: string;
}

export interface TaxtrResult {
  query: string;
  question: string;
  answer: string;
}

export interface StrategyResult {
  query: string;
  final_report: string;
  court_cases?: CourtCase[];
  taxtr_cases?: TaxtrCase[];
  law_articles?: LawArticle[];
  deadlines?: Record<string, string>;
}

export interface RebuttalResult {
  query: string;
  final_report: string;
  winning_court_cases?: CourtCase[];
  favorable_taxtr_cases?: TaxtrCase[];
  law_articles?: LawArticle[];
  unverified_citations?: string[];
  deadlines?: Record<string, string>;
}

export interface TrendResult {
  query: string;
  final_report: string;
  trend_data?: {
    total_cases?: number;
    year_stats?: Record<string, { total: number; taxpayer_win: number; win_rate: number }>;
    sample?: CourtCase[];
  };
  taxtr_sample?: TaxtrCase[];
}

export interface ITCLResult {
  query: string;
  final_report: string;
  court_cases?: CourtCase[];
  law_articles?: LawArticle[];
  itcl_issues?: any[];
  preferred_methods?: string[];
  transaction_type?: string;
}

export interface RiskResult {
  query: string;
  final_report: string;
  affected_court_cases?: CourtCase[];
  affected_taxtr_cases?: TaxtrCase[];
  revised_articles?: LawArticle[];
}

export type AnyResult =
  | InsightResult | MultiResult | TaxlawPrecResult | TaxtrResult
  | StrategyResult | RebuttalResult | TrendResult | ITCLResult | RiskResult;

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ConversationTurn = { query: string; result: AnyResult };

/* ── context shape ── */

interface AgentUIState {
  agentType: AgentType;
  setAgentType: (t: AgentType) => void;
  query: string;
  setQuery: (q: string) => void;
  caseId: string;
  setCaseId: (id: string) => void;
  riskRevision: string;
  setRiskRevision: (v: string) => void;
  riskEffectiveDate: string;
  setRiskEffectiveDate: (v: string) => void;
  uploadFile: File | null;
  setUploadFile: (f: File | null) => void;
  // STRATEGY + REBUTTAL 공통
  dispositionDate: string;
  setDispositionDate: (v: string) => void;
  taxAmount: string;
  setTaxAmount: (v: string) => void;
  // STRATEGY
  alreadyFiled: boolean;
  setAlreadyFiled: (v: boolean) => void;
  // REBUTTAL
  filingType: string;
  setFilingType: (v: string) => void;
  taxpayerName: string;
  setTaxpayerName: (v: string) => void;
  taxpayerIdNo: string;
  setTaxpayerIdNo: (v: string) => void;
  taxOffice: string;
  setTaxOffice: (v: string) => void;
  rebuttalTaxType: string;
  setRebuttalTaxType: (v: string) => void;
  // ITCL
  transactionType: string;
  setTransactionType: (v: string) => void;
  relatedPartyCountry: string;
  setRelatedPartyCountry: (v: string) => void;
  transactionAmountKrw: string;
  setTransactionAmountKrw: (v: string) => void;
  transactionYear: string;
  setTransactionYear: (v: string) => void;
  isRunning: boolean;
  result: AnyResult | null;
  steps: string[];
  error: string | null;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  // 멀티턴 대화
  conversationHistory: ConversationTurn[];
  chatMessages: ChatMessage[];   // 백엔드 전송용 [{role, content}]
  startNewConversation: () => void;
  run: () => Promise<void>;
  clear: () => void;
}

const AgentUIContext = createContext<AgentUIState | null>(null);

export function AgentUIProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  const [agentType, setAgentType] = useState<AgentType>("MULTI");
  const [query, setQuery] = useState("");
  const [caseId, setCaseId] = useState("");
  const [riskRevision, setRiskRevision] = useState("");
  const [riskEffectiveDate, setRiskEffectiveDate] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  // STRATEGY + REBUTTAL 공통
  const [dispositionDate, setDispositionDate] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  // STRATEGY
  const [alreadyFiled, setAlreadyFiled] = useState(false);
  // REBUTTAL
  const [filingType, setFilingType] = useState("심판청구");
  const [taxpayerName, setTaxpayerName] = useState("");
  const [taxpayerIdNo, setTaxpayerIdNo] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [rebuttalTaxType, setRebuttalTaxType] = useState("");
  // ITCL
  const [transactionType, setTransactionType] = useState("기타");
  const [relatedPartyCountry, setRelatedPartyCountry] = useState("");
  const [transactionAmountKrw, setTransactionAmountKrw] = useState("");
  const [transactionYear, setTransactionYear] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AnyResult | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const run = async () => {
    if (!query.trim() || isRunning) return;

    setIsRunning(true);
    setResult(null);
    setSteps([]);
    setError(null);

    const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";
    let token: string | null = null;
    if (!DEV_MODE) {
      try {
        token = await getToken({ template: "backend-api" });
      } catch {
        try { token = await getToken(); } catch { /* proceed without token */ }
      }
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // 현재 대화 히스토리 (백엔드 전송용)
    const currentMessages = [...chatMessages];

    try {
      let json: any;

      if (agentType === "INSIGHT") {
        const res = await fetch(`${API_BASE}/api/agent/insight`, {
          method: "POST", headers,
          body: JSON.stringify({ query: query.trim(), ...(caseId.trim() ? { case_id: caseId.trim() } : {}), messages: currentMessages }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        json = await res.json();

      } else if (agentType === "MULTI") {
        const res = await fetch(`${API_BASE}/api/agent/multi`, {
          method: "POST", headers,
          body: JSON.stringify({ query: query.trim(), messages: currentMessages }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        json = await res.json();

      } else if (agentType === "TAXLAW_PREC") {
        const res = await fetch(`${API_BASE}/api/prec/ask`, {
          method: "POST", headers,
          body: JSON.stringify({ question: query.trim(), messages: currentMessages }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        const raw = await res.json();
        json = { query: query.trim(), question: raw.question, answer: raw.answer } as TaxlawPrecResult;

      } else if (agentType === "TAXTR") {
        const res = await fetch(`${API_BASE}/api/taxtr/ask`, {
          method: "POST", headers,
          body: JSON.stringify({ question: query.trim(), messages: currentMessages }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        const raw = await res.json();
        json = { query: query.trim(), question: raw.question, answer: raw.answer } as TaxtrResult;

      } else if (agentType === "STRATEGY") {
        const res = await fetch(`${API_BASE}/api/strategy/strategy`, {
          method: "POST", headers,
          body: JSON.stringify({
            summary: query.trim(),
            ...(dispositionDate.trim() ? { disposition_date: dispositionDate.trim() } : {}),
            ...(taxAmount.trim() ? { tax_amount: taxAmount.trim() } : {}),
            already_filed: alreadyFiled,
            messages: currentMessages,
          }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        const raw = await res.json();
        json = { query: query.trim(), ...raw } as StrategyResult;

      } else if (agentType === "REBUTTAL") {
        let res: Response;
        if (uploadFile) {
          const formData = new FormData();
          formData.append("file", uploadFile);
          const uploadHeaders: Record<string, string> = {};
          if (token) uploadHeaders["Authorization"] = `Bearer ${token}`;
          res = await fetch(`${API_BASE}/api/strategy/rebuttal/upload`, {
            method: "POST",
            headers: uploadHeaders,
            body: formData,
          });
        } else {
          res = await fetch(`${API_BASE}/api/strategy/rebuttal`, {
            method: "POST", headers,
            body: JSON.stringify({
              disposition_text: query.trim(),
              filing_type: filingType || "심판청구",
              ...(taxpayerName.trim() ? { taxpayer_name: taxpayerName.trim() } : {}),
              ...(taxpayerIdNo.trim() ? { taxpayer_id: taxpayerIdNo.trim() } : {}),
              ...(taxOffice.trim() ? { tax_office: taxOffice.trim() } : {}),
              ...(dispositionDate.trim() ? { disposition_date: dispositionDate.trim() } : {}),
              ...(taxAmount.trim() ? { tax_amount: taxAmount.trim() } : {}),
              ...(rebuttalTaxType.trim() ? { tax_type: rebuttalTaxType.trim() } : {}),
              messages: currentMessages,
            }),
          });
        }
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        const raw = await res.json();
        json = { query: query.trim(), ...raw } as RebuttalResult;

      } else if (agentType === "TREND") {
        const res = await fetch(`${API_BASE}/api/trend/ask`, {
          method: "POST", headers,
          body: JSON.stringify({ query: query.trim(), messages: currentMessages }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        const raw = await res.json();
        json = { query: query.trim(), ...raw } as TrendResult;

      } else if (agentType === "ITCL") {
        const res = await fetch(`${API_BASE}/api/itcl/ask`, {
          method: "POST", headers,
          body: JSON.stringify({
            query: query.trim(),
            transaction_type: transactionType || "기타",
            ...(relatedPartyCountry.trim() ? { related_party_country: relatedPartyCountry.trim() } : {}),
            ...(transactionAmountKrw.trim() ? { transaction_amount_krw: parseInt(transactionAmountKrw.replace(/,/g, ""), 10) || 0 } : {}),
            ...(transactionYear.trim() ? { transaction_year: transactionYear.trim() } : {}),
            messages: currentMessages,
          }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        const raw = await res.json();
        json = { query: query.trim(), ...raw } as ITCLResult;

      } else {
        // RISK
        const res = await fetch(`${API_BASE}/api/strategy/risk`, {
          method: "POST", headers,
          body: JSON.stringify({
            statute_name: query.trim(),
            revision_summary: riskRevision.trim(),
            effective_date: riskEffectiveDate.trim(),
          }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        const raw = await res.json();
        json = { query: query.trim(), ...raw } as RiskResult;
      }

      setResult(json);
      if (json.steps) setSteps(json.steps);

      // 대화 히스토리 누적
      const userMsg: ChatMessage = { role: "user", content: query.trim() };
      const assistantContent = (json.final_report || json.answer || "").slice(0, 800);
      const assistantMsg: ChatMessage = { role: "assistant", content: assistantContent };
      setChatMessages(prev => [...prev, userMsg, assistantMsg]);
      setConversationHistory(prev => [...prev, { query: query.trim(), result: json }]);
    } catch (err: any) {
      setError(err?.message ?? "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsRunning(false);
    }
  };

  const startNewConversation = () => {
    setResult(null);
    setSteps([]);
    setError(null);
    setConversationHistory([]);
    setChatMessages([]);
    setQuery("");
  };

  const clear = () => {
    setResult(null);
    setSteps([]);
    setError(null);
    setUploadFile(null);
    setDispositionDate("");
    setTaxAmount("");
    setAlreadyFiled(false);
    setFilingType("심판청구");
    setTaxpayerName("");
    setTaxpayerIdNo("");
    setTaxOffice("");
    setRebuttalTaxType("");
    setTransactionType("기타");
    setRelatedPartyCountry("");
    setTransactionAmountKrw("");
    setTransactionYear("");
  };

  return (
    <AgentUIContext.Provider
      value={{
        agentType, setAgentType,
        query, setQuery,
        caseId, setCaseId,
        riskRevision, setRiskRevision,
        riskEffectiveDate, setRiskEffectiveDate,
        uploadFile, setUploadFile,
        dispositionDate, setDispositionDate,
        taxAmount, setTaxAmount,
        alreadyFiled, setAlreadyFiled,
        filingType, setFilingType,
        taxpayerName, setTaxpayerName,
        taxpayerIdNo, setTaxpayerIdNo,
        taxOffice, setTaxOffice,
        rebuttalTaxType, setRebuttalTaxType,
        transactionType, setTransactionType,
        relatedPartyCountry, setRelatedPartyCountry,
        transactionAmountKrw, setTransactionAmountKrw,
        transactionYear, setTransactionYear,
        isRunning, result, steps, error,
        sidebarOpen, setSidebarOpen,
        conversationHistory, chatMessages,
        startNewConversation,
        run, clear,
      }}
    >
      {children}
    </AgentUIContext.Provider>
  );
}

export function useAgentUI() {
  const ctx = useContext(AgentUIContext);
  if (!ctx) throw new Error("useAgentUI must be inside AgentUIProvider");
  return ctx;
}

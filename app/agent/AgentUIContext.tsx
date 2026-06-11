"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export type AgentType = "INSIGHT" | "MULTI" | "TAXLAW_PREC" | "TAXTR";

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
  steps: string[];
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
  taxlaw_prec_context?: {
    doc_id: string;
    case_no: string;
    tax_type: string;
    decision: string;
    title: string;
    attr_yr: string;
    document: string;
  }[];
  taxtr_context?: {
    doc_id: string;
    dem_no: string;
    decision_type: string;
    title: string;
    document: string;
  }[];
  law_context: {
    related_issues: { set_key: string; issue_id: string; issue_title: string; issue_summary: string; similarity: number }[];
    articles: { scope: string; version_key: string; article_id: string; article_title: string; related_issue: string }[];
  };
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

export type AnyResult = InsightResult | MultiResult | TaxlawPrecResult | TaxtrResult;

/* ── context shape ── */

interface AgentUIState {
  agentType: AgentType;
  setAgentType: (t: AgentType) => void;
  query: string;
  setQuery: (q: string) => void;
  caseId: string;
  setCaseId: (id: string) => void;
  isRunning: boolean;
  result: AnyResult | null;
  steps: string[];
  error: string | null;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  run: () => Promise<void>;
  clear: () => void;
}

const AgentUIContext = createContext<AgentUIState | null>(null);

export function AgentUIProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  const [agentType, setAgentType] = useState<AgentType>("MULTI");
  const [query, setQuery] = useState("");
  const [caseId, setCaseId] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AnyResult | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const run = async () => {
    if (!query.trim() || isRunning) return;

    setIsRunning(true);
    setResult(null);
    setSteps([]);
    setError(null);

    const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";
    const token = DEV_MODE ? null : await getToken({ template: "backend-api" });
    if (!token && !DEV_MODE) {
      setError("로그인이 필요합니다.");
      setIsRunning(false);
      return;
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      let json: any;

      if (agentType === "INSIGHT") {
        const res = await fetch(`${API_BASE}/api/agent/insight`, {
          method: "POST",
          headers,
          body: JSON.stringify({ query: query.trim(), ...(caseId.trim() ? { case_id: caseId.trim() } : {}) }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        json = await res.json();

      } else if (agentType === "MULTI") {
        const res = await fetch(`${API_BASE}/api/agent/multi`, {
          method: "POST",
          headers,
          body: JSON.stringify({ query: query.trim() }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        json = await res.json();

      } else if (agentType === "TAXLAW_PREC") {
        const res = await fetch(`${API_BASE}/api/prec/ask`, {
          method: "POST",
          headers,
          body: JSON.stringify({ question: query.trim() }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        const raw = await res.json();
        json = { query: query.trim(), question: raw.question, answer: raw.answer } as TaxlawPrecResult;

      } else {
        // TAXTR
        const res = await fetch(`${API_BASE}/api/taxtr/ask`, {
          method: "POST",
          headers,
          body: JSON.stringify({ question: query.trim() }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => `오류 ${res.status}`));
        const raw = await res.json();
        json = { query: query.trim(), question: raw.question, answer: raw.answer } as TaxtrResult;
      }

      setResult(json);
      if (json.steps) setSteps(json.steps);
    } catch (err: any) {
      setError(err?.message ?? "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsRunning(false);
    }
  };

  const clear = () => {
    setResult(null);
    setSteps([]);
    setError(null);
  };

  return (
    <AgentUIContext.Provider
      value={{
        agentType, setAgentType,
        query, setQuery,
        caseId, setCaseId,
        isRunning, result, steps, error,
        sidebarOpen, setSidebarOpen,
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

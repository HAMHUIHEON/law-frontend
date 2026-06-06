"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export type AgentType = "INSIGHT" | "MULTI";

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
  law_context: {
    related_issues: { set_key: string; issue_id: string; issue_title: string; issue_summary: string; similarity: number }[];
    articles: { scope: string; version_key: string; article_id: string; article_title: string; related_issue: string }[];
  };
  tools_used: string[];
}

interface AgentUIState {
  agentType: AgentType;
  setAgentType: (t: AgentType) => void;
  query: string;
  setQuery: (q: string) => void;
  caseId: string;
  setCaseId: (id: string) => void;
  isRunning: boolean;
  result: InsightResult | MultiResult | null;
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
  const [result, setResult] = useState<InsightResult | MultiResult | null>(null);
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

    const endpoint = agentType === "INSIGHT" ? "/api/agent/insight" : "/api/agent/multi";
    const body =
      agentType === "INSIGHT"
        ? { query: query.trim(), ...(caseId.trim() ? { case_id: caseId.trim() } : {}) }
        : { query: query.trim() };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `오류 ${res.status}`);
      }

      const json = await res.json();
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

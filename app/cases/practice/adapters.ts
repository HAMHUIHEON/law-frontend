// law-frontend/app/cases/practice/adapters.ts

export type PracticeVM = {
  meta: {
    caseNumber: string;
  };
  summary: {
    oneLiner: string;
    coreIssues: string[];
    judicialHow: string;
    legalContext: string[];
    riskView: {
      taxpayer: string;
      authority: string;
      precedent: string;
    };
  };
  chains: Array<{
    issue: string;
    premise: string;
    evidence: string;
    rule: string;
    application: string;
    inference: string;
    miniConclusion: string;
  }>;
};

function asString(v: any, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function asStringArray(v: any): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

export function adaptCasePractice(api: any): PracticeVM {
  // ✅ 원본 코드 기준: data.executive_summary.executive_summary
  const summary = api?.executive_summary?.executive_summary ?? {};
  const body = api?.body ?? {};

  const chains = asStringArray(body?.issue_logic?.issue_logic_chains)
    ? [] // (안 쓰임, 방어)
    : [];

  const rawChains = Array.isArray(body?.issue_logic?.issue_logic_chains)
    ? body.issue_logic.issue_logic_chains
    : [];

  return {
    meta: {
      caseNumber: asString(body?.metadata?.case_number),
    },
    summary: {
      oneLiner: asString(summary?.one_liner),
      coreIssues: asStringArray(summary?.core_issues),
      judicialHow: asString(summary?.judicial_logic?.how_the_court_thought),
      legalContext: asStringArray(summary?.judicial_logic?.legal_context),
      riskView: {
        taxpayer: asString(summary?.risk_view?.taxpayer_risk),
        authority: asString(summary?.risk_view?.tax_authority_risk),
        precedent: asString(summary?.risk_view?.precedent_signal),
      },
    },
    chains: rawChains.map((c: any) => ({
      issue: asString(c?.issue),
      premise: asString(c?.premise),
      evidence: asString(c?.evidence),
      rule: asString(c?.rule),
      application: asString(c?.application),
      inference: asString(c?.inference),
      miniConclusion: asString(c?.mini_conclusion),
    })),
  };
}

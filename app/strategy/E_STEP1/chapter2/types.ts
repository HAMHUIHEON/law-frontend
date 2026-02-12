//app/strategy/E_STEP1/chapter2/types.ts

/* ========= RAW ========= */

export type EvidenceStatus = "근거 있음" | "근거 부족";

export type Chapter2Step1Raw = {
  chapter_summary: {
    text: string;
    evidence_articles: string[];
    evidence_status: EvidenceStatus;
    additional_explanation: string | null;
  };

  investigation_structure: InvestigationStructureItem[];

  key_operating_principles: OperatingPrinciple[];

  authority_and_control_map: AuthorityControlPoint[];

  major_branch_points: MajorBranchPoint[];

  tables: AnalysisTable[];

  table_policy: {
    table_required: boolean;
    reason_if_omitted: string | null;
  };

  bridge_to_step2: {
    step1_limit: string;
    step2_focus: string;
  };
};

export type InvestigationStructureItem = {
  structural_unit: string;
  description: string;
  structural_effect: string;
  evidence_articles: string[];
  evidence_status: EvidenceStatus;
  additional_explanation: string | null;
};

export type OperatingPrinciple = {
  principle: string;
  how_it_operates: string;
  when_it_breaks: string | null;
  evidence_articles: string[];
  evidence_status: EvidenceStatus;
  additional_explanation: string | null;
};

export type AuthorityControlPoint = {
  control_point: string;
  who_controls: string;
  timing_in_flow: string;
  how_control_is_described_in_text: string;
  evidence_articles: string[];
  evidence_status: EvidenceStatus;
  additional_explanation: string | null;
};

export type MajorBranchPoint = {
  decision_question: string;
  trigger_defined_in_text: string;
  structural_consequence: string;
  next_structural_change_defined_in_text: string;
  evidence_articles: string[];
  evidence_status: EvidenceStatus;
  additional_explanation: string | null;
};

export type AnalysisTableRow = Record<string, string>;

export type AnalysisTable = {
  table_title: string;
  table_purpose: string;
  table_markdown: string;
  rows: AnalysisTableRow[];
  evidence_articles: string[];
  evidence_status: EvidenceStatus;
  additional_explanation: string | null;
};


/* ========= UI MODEL ========= */
/*
  원본은 전부 raw에 그대로 보존.
  UI에서 쓰기 편하도록 flat view만 추가.
*/

export type Chapter2Step1ViewModel = {
  raw: Chapter2Step1Raw;

  summaryText: string;

  investigationUnits: InvestigationStructureItem[];
  principles: OperatingPrinciple[];
  controlPoints: AuthorityControlPoint[];
  branchPoints: MajorBranchPoint[];
  tables: AnalysisTable[];

  bridge: {
    limit: string;
    focus: string;
  };
};

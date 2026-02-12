//app/strategy/E_STEP1/chapter3/types.ts
/* ========= RAW ========= */

export type EvidenceStatus = "근거 있음" | "근거 부족";

export type Chapter3Scope = {
  system_role: string;
  transition_position: string;
  control_philosophy: string;
};

export type Chapter3Summary = {
  chapter_scope: Chapter3Scope;
  text: string;
  evidence_articles: string[];
  evidence_status: EvidenceStatus;
  additional_explanation: string | null;
};

export type TransitionFromChapter2 = {
  trigger_conditions: string;
  how_chapter2_rules_are_modified: string;
  evidence_articles: string[];
  evidence_status: EvidenceStatus;
  additional_explanation: string | null;
};

export type InvestigationStructureUnit = {
  structural_unit: string;
  description: string;
  structural_effect: string;
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

export type CoerciveMeasure = {
  measure_type: string;
  trigger_defined_in_text: string;
  approving_authority: string;
  procedural_limit_defined_in_text: string;
  evidence_articles: string[];
  evidence_status: EvidenceStatus;
  additional_explanation: string | null;
};

export type DecisionToPunishStage = {
  stage: string;
  decision_maker: string;
  decision_content: string;
  next_possible_outcomes: string[];
  evidence_articles: string[];
  evidence_status: EvidenceStatus;
};

export type TableBlock = {
  table_title: string;
  table_purpose: string;
  table_markdown: string;
  rows: Record<string, string>[];
  evidence_articles: string[];
  evidence_status: EvidenceStatus;
  additional_explanation: string | null;
};

export type TablePolicy = {
  table_required: boolean;
  reason_if_omitted: string | null;
};

export type BridgeToStep2 = {
  step1_limit: string;
  step2_focus: string;
};

export type Chapter3Step1Raw = {
  chapter: string;

  chapter_summary: Chapter3Summary;
  transition_from_chapter2: TransitionFromChapter2;

  investigation_structure: InvestigationStructureUnit[];
  authority_and_control_map: AuthorityControlPoint[];
  coercive_measures_structure: CoerciveMeasure[];
  decision_to_punish_pipeline: DecisionToPunishStage[];

  tables: TableBlock[];
  table_policy: TablePolicy;

  bridge_to_step2: BridgeToStep2;
};

/* ========= UI MODEL ========= */

export type Chapter3Step1ViewModel = {
  raw: Chapter3Step1Raw;

  summaryText: string;

  scope: Chapter3Scope;
  transition: TransitionFromChapter2;

  investigationUnits: InvestigationStructureUnit[];
  controlPoints: AuthorityControlPoint[];
  coerciveMeasures: CoerciveMeasure[];
  decisionPipeline: DecisionToPunishStage[];

  tables: TableBlock[];

  bridge: {
    limit: string;
    focus: string;
  };
};

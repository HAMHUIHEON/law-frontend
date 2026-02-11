/* ========= RAW ========= */

export type EvidenceStatus = "근거 있음" | "근거 부족";

export type RawPrincipleAxis = {
  principle: string;
  articles: string[];
  practical_meaning: string;
  evidence_status: EvidenceStatus;
};

export type RawAuthorityAxis = {
  topic: string;
  articles: string[];
  control_function: string;
  evidence_status: EvidenceStatus;
};

export type RawProcedureStage = {
  stage: "선정" | "계획" | "시작" | "진행" | "종결";
  articles: string[];
  key_controls: string;
  evidence_status: EvidenceStatus;
};

export type RawDefinitionComparisonRow = {
  category: "일반세무조사" | "현장확인" | "조세범칙조사사무";
  definition_summary: string;
  authority_basis: string;
  plan_notice_requirements: string;
  notes: string;
  evidence_status: EvidenceStatus;
};

export type RawDefinitionComparisonTable = {
  columns: string[];
  table_markdown: string;
  rows: RawDefinitionComparisonRow[];
};

export type RawDefensePoint = {
  scenario: string;
  articles: string[];
  legal_requirement: string;
  practical_commentary: string;
  evidence_status: EvidenceStatus;
};

export type RawInternalOperationPoint = {
  operation_area: string;
  articles: string[];
  operational_implication: string;
  evidence_status: EvidenceStatus;
};

export type RawBridgeQuestion = {
  question: string;
  related_next_chapter: "제2장" | "제3장" | "제4장";
  why_it_matters: string;
};

export type RawExtraExplanation = {
  topic: string;
  reason_separated: string;
  notes: string;
};

export type RawChapterOneStep1 = {
  chapter_summary: string;
  principle_axis: RawPrincipleAxis[];
  authority_axis: RawAuthorityAxis[];
  procedure_axis: RawProcedureStage[];
  definition_comparison_table: RawDefinitionComparisonTable;
  defense_points: RawDefensePoint[];
  internal_operation_points: RawInternalOperationPoint[];
  bridge_questions: RawBridgeQuestion[];
  extra_explanations: RawExtraExplanation[];
};



/* ========= UI MODEL ========= */

export type PrincipleView = {
  title: string;
  articles: string[];
  meaning: string;
  evidenceStatus: EvidenceStatus;
};

export type AuthorityView = {
  topic: string;
  articles: string[];
  controlFunction: string;
  evidenceStatus: EvidenceStatus;
};

export type ProcedureStageView = {
  stage: string;
  articles: string[];
  keyControls: string;
  evidenceStatus: EvidenceStatus;
};

export type DefinitionRowView = {
  category: string;
  definition: string;
  authority: string;
  noticeRequirement: string;
  notes: string;
  evidenceStatus: EvidenceStatus;
};

export type DefensePointView = {
  scenario: string;
  articles: string[];
  legalRequirement: string;
  commentary: string;
  evidenceStatus: EvidenceStatus;
};

export type InternalOperationView = {
  area: string;
  articles: string[];
  implication: string;
  evidenceStatus: EvidenceStatus;
};

export type BridgeQuestionView = {
  question: string;
  nextChapter: string;
  why: string;
};

export type ExtraExplanationView = {
  topic: string;
  reasonSeparated: string;
  notes: string;
};

export type ChapterOneStep1ViewModel = {
  summary: string;

  principles: PrincipleView[];
  authorities: AuthorityView[];
  procedureStages: ProcedureStageView[];

  definitionTable: {
    columns: string[];
    rows: DefinitionRowView[];
  };

  defensePoints: DefensePointView[];
  internalOperations: InternalOperationView[];

  bridgeQuestions: BridgeQuestionView[];
  extraExplanations: ExtraExplanationView[];
};

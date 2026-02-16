// E_STEP2/types.ts

export type NormativeAnchor = {
  external_article: string;
  legal_function: string;
  dependency_type: string;
  internal_linkage: string[];
  interpretation_limit: string;
};

export type L0 = {
  normative_anchors: NormativeAnchor[];
};

export type Component = {
  name: string;
  description: string;
  legal_basis: string[];
};

export type ArticleMap = {
  component: string;
  articles: string[];
};

export type L1 = {
  scope_statement: string;
  components: Component[];
  article_map: ArticleMap[];
};

export type EngineItem = {
  mechanism_statement: string;
  internal_legal_basis: string[];
  external_legal_basis: string[];
  failure_mode: string;
  evidence_status: string;
};

export type EngineBlock = {
  items: EngineItem[];
  reason: string | null;
};

export type L2 = {
  Authority: EngineBlock;
  Trigger: EngineBlock;
  Gate: EngineBlock;
  Notice: EngineBlock;
  Record_Form: EngineBlock;
  Limits: EngineBlock;
};

export type DisputePoint = {
  issue: string;
  positions: {
    taxpayer: string;
    tax_office: string;
  };
  key_evidence: string[];
  internal_legal_basis: string[];
  external_legal_basis: string[];
};

export type DefenseChecklistItem = {
  check: string;
  why_it_matters: string;
  internal_legal_basis: string[];
  external_legal_basis: string[];
};

export type OpsArtifact = {
  artifact: string;
  owner: string;
  timing: string;
  retention: string;
  internal_legal_basis: string[];
  external_legal_basis: string[];
};

export type SystemTension = {
  description: string;
  internal_side: string[];
  external_side: string[];
  tension_type: string;
};

export type L3 = {
  dispute_points: {
    items: DisputePoint[];
    reason: string | null;
  };
  defense_checklist: {
    items: DefenseChecklistItem[];
    reason: string | null;
  };
  ops_artifacts: {
    items: OpsArtifact[];
    reason: string | null;
  };
  conversion_rules: {
    items: any[];
    reason: string | null;
  };
  system_tension: SystemTension;
};

export type Step2SectionRaw = {
  chapter: string;
  section: string;
  L0: L0;
  L1: L1;
  L2: L2;
  L3: L3;
};

export type Step2SectionViewModel = Step2SectionRaw;

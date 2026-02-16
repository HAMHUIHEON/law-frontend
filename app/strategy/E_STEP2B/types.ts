// 29_FINAL/law-frontend/app/strategy/E_STEP2B/types.ts
export interface InternalMechanism {
  section: string;
  layer: "L2" | "L3";
  category: string;
  internal_legal_basis: string[];
}

export interface NormativeDependency {
  external_article: string;
  substantive_structure: string;
  dependency_type: string;
  interpretation_limit: string;
  linked_internal_mechanisms: InternalMechanism[];
}

export interface ThresholdAnalysis {
  external_article: string;
  threshold_type: string;
  internal_trigger_point: InternalMechanism[];
  escalation_path: string;
  risk_note: string;
}

export interface RiskEscalation {
  stage: string;
  external_norm: string[];
  internal_control: InternalMechanism[];
  escalation_condition: string;
  systemic_risk: string;
  tension_type: string;
}

export interface Step2bChapterAnalysis {
  chapter: string;
  normative_dependency_map: NormativeDependency[];
  substantive_threshold_analysis: ThresholdAnalysis[];
  risk_escalation_map: RiskEscalation[];
}

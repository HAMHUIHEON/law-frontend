// 29_FINAL/law-frontend/app/strategy/E_STEP2B/types.ts
/* =========================================================
   Shared
========================================================= */

export interface InternalMechanism {
  section: string;
  layer: "L2" | "L3";
  category: string;
  internal_legal_basis: string[];
}

/* =========================================================
   Chapter 1
========================================================= */

export interface Ch1NormativeDependency {
  external_article: string;
  substantive_structure: string;
  dependency_type: string;
  interpretation_limit: string;
  linked_internal_mechanisms: InternalMechanism[];
}

export interface Ch1ThresholdAnalysis {
  external_article: string;
  threshold_type: string;
  internal_trigger_point: InternalMechanism[];
  escalation_path: string;
  risk_note: string;
}

export interface Ch1RiskEscalation {
  stage: string;
  external_norm: string[];
  internal_control: InternalMechanism[];
  escalation_condition: string;
  systemic_risk: string;
  tension_type: string;
}

export interface Step2bChapter1 {
  chapter: string;
  normative_dependency_map: Ch1NormativeDependency[];
  substantive_threshold_analysis: Ch1ThresholdAnalysis[];
  risk_escalation_map: Ch1RiskEscalation[];
}


/* =========================================================
   Chapter 2
========================================================= */

export interface Ch2NormativeDependency {
  external_norm: string;
  normative_function: string;
  linked_internal_mechanisms: InternalMechanism[];
  dependency_statement: string;
  interpretation_limit: string;
}

export interface Ch2ProceduralThreshold {
  threshold_name: string;
  external_trigger_norms: string[];
  internal_trigger_points: InternalMechanism[];
  threshold_logic: string;
  risk_note: string;
}

export interface Ch2ConversionControl {
  conversion_type: string;
  external_constraints: string[];
  internal_decision_nodes: InternalMechanism[];
  decision_body: string;
  notice_link: string;
  interpretation_limit: string;
}

export interface Ch2ControlConsequence {
  control_issue: string;
  external_system: string[];
  internal_controls: InternalMechanism[];
  consequence_path: string;
  tension_note: string;
}

export interface Step2bChapter2 {
  chapter: string;
  normative_dependency_map: Ch2NormativeDependency[];
  procedural_threshold_analysis: Ch2ProceduralThreshold[];
  conversion_control_map: Ch2ConversionControl[];
  control_consequence_link: Ch2ControlConsequence[];
}


/* =========================================================
   Chapter 3
========================================================= */

export interface Ch3NormativeDependency {
  external_article: string;
  substantive_structure: string;
  dependency_type: string;
  interpretation_limit: string;
  linked_internal_mechanisms: InternalMechanism[];
}

export interface Ch3SubstantiveThreshold {
  external_article: string;
  threshold_type: string;
  internal_trigger_point: InternalMechanism[];
  escalation_path: string;
  risk_note: string;
}

export interface Ch3ConversionSubstance {
  conversion_type: string;
  external_basis: string[];
  internal_decision_node: InternalMechanism[];
  substantive_reference: string[];
  decision_dependency: string;
  interpretation_limit: string;
}

export interface Ch3RiskEscalation {
  stage: string;
  external_norm: string[];
  internal_control: InternalMechanism[];
  escalation_condition: string;
  systemic_risk: string;
  tension_type: string;
}

export interface Step2bChapter3 {
  chapter: string;
  normative_dependency_map: Ch3NormativeDependency[];
  substantive_threshold_analysis: Ch3SubstantiveThreshold[];
  conversion_substance_link: Ch3ConversionSubstance[];
  risk_escalation_map: Ch3RiskEscalation[];
}


/* =========================================================
   Union
========================================================= */

export type Step2bChapterAnalysis =
  | Step2bChapter1
  | Step2bChapter2
  | Step2bChapter3;

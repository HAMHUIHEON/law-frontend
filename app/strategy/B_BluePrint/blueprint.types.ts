// B_BLUEPRINT/blueprint.types.ts

/* ========= RAW (백엔드 원본) ========= */

export type RawBlueprintAction = {
  action: string;
  purpose: string;
  prerequisites: string[];
};

export type RawDecisionPoint = {
  condition: string;
  options: string[];
  implications: string;
};

export type RawEscalationPath = {
  trigger: string;
  target: string;
  handover_requirements: string[];
};

export type RawBlueprint = {
  book_id: string;
  block_id: string;

  entry_triggers: string[];
  actions: RawBlueprintAction[];
  decision_points: RawDecisionPoint[];
  escalation_paths: RawEscalationPath[];
  stop_lines: string[];
  required_artifacts: string[];
};

export type RawBlueprintResponse = {
  book_id: string;
  count: number;
  items: RawBlueprint[];
};


/* ========= UI (프론트 표준 모델) ========= */

export type BlueprintAction = {
  text: string;
  purpose: string;
  prerequisites: string[];
};

export type DecisionPoint = {
  condition: string;
  options: string[];
  implications: string;
};

export type EscalationPath = {
  trigger: string;
  target: string;
  requirements: string[];
};

export type Blueprint = {
  blockId: string;

  entryTriggers: string[];
  actions: BlueprintAction[];
  decisionPoints: DecisionPoint[];
  escalationPaths: EscalationPath[];
  stopLines: string[];
  requiredArtifacts: string[];
};

export type BlueprintIndex = {
  bookId: string;
  blockIds: string[];                 // 🔑 sidebar dropdown용
  byBlockId: Record<string, Blueprint>;
};

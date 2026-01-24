// B_APP_MAP/map.types.ts

/* ========= RAW ========= */

export type RawOperationalMap = {
  book_id: string;

  investigation_phases: string[];
  always_on_blocks: string[];

  conditional_blocks: Record<string, string[]>;

  key_decision_bottlenecks: string[];

  minimum_viable_setup: Record<string, string[]>;
  advanced_setup: Record<string, string[]>;

  organisational_adaptation_notes: string[];
  how_to_use_this_blueprint: string[];
};


/* ========= UI MODEL ========= */

export type ConditionalBlockGroup = {
  condition: string;
  blockIds: string[];
};

export type SetupGroup = {
  label: string;
  blockIds: string[];
};

export type OperationalMapViewModel = {
  bookId: string;

  investigationPhases: string[];

  alwaysOnBlocks: string[];
  conditionalBlocks: ConditionalBlockGroup[];

  keyDecisionBottlenecks: string[];

  minimumViableSetups: SetupGroup[];
  advancedSetups: SetupGroup[];

  organisationalNotes: string[];
  usageGuide: string[];
};

// C_RISK/types.ts

export type RiskTypologyBlock = {
  typology_id: string;        // "T01"
  typology_name: string;

  page_start: number;
  page_end: number;

  crime_type_tags: string[];
  structural_pattern: string[];
  common_enablers: string[];
  detection_signals: string[];

  why_this_matters_now: string;
};

export type RiskTypologyResponse = {
  book_id: string;
  generated_from: string;
  risk_typology_blocks: RiskTypologyBlock[];
};

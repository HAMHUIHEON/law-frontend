// law-frontend/app/strategy/Summary/adapters/FatfRecommendations2012Blocks.adapter.ts
// FATF Recommendations 2012 전용 exec_summary_blocks 어댑터
// JSON 스키마를 그대로 타입으로 반영 + VM 변환

/* ======================================================
 * 원본 JSON 스키마 (exec_summary_blocks.json)
 * ====================================================== */

export interface FatfPageRangeJson {
  page_start: number;
  page_end: number;
}

export interface FatfRecommendationCognitiveStateJson {
  core_message: string;
  risk_and_policy_focus: string[];
  scope_and_coverage: string[];
  minimum_required_measures: string[];
  implementation_mechanisms: string[];
  supervision_and_enforcement: string[];
  flexibility_and_national_discretion: string[];
  typical_gaps_or_failure_modes: string[];
  implementation_challenges: string[];
  cross_reference_and_dependencies: string[];
  notes_for_readers: string[];
}

export interface FatfStepJDocJson {
  book_id: string;
  section_title: string;
  page_range: FatfPageRangeJson;
  section_key: string;
  fatf_recommendation_cognitive_state: FatfRecommendationCognitiveStateJson;
}

export interface FatfExecSummaryBlockJson {
  block_id: string;
  book_id: string;
  section_title: string;
  page_range: FatfPageRangeJson;
  source_section_keys: string[];
  stepj_doc: FatfStepJDocJson;
}

/** exec_summary_blocks.json 루트: 블록 배열 */
export type FatfExecSummaryBlocksJson = FatfExecSummaryBlockJson[];

/* ======================================================
 * VM 타입 (뷰 편의용 + 원본 보존)
 * ====================================================== */

export interface FatfExecSummarySourceBlockVM {
  /** 원본 JSON 한 블록 전체 (정보 손실 없이 보존) */
  raw: FatfExecSummaryBlockJson;

  /** 공통 메타 */
  blockId: string;
  bookId: string;
  sectionTitle: string;

  pageRange: {
    pageStart: number;
    pageEnd: number;
  };

  sourceSectionKeys: string[];

  /** fatf_recommendation_cognitive_state 전체를 평탄화 */
  cognitiveState: {
    coreMessage: string;
    riskAndPolicyFocus: string[];
    scopeAndCoverage: string[];
    minimumRequiredMeasures: string[];
    implementationMechanisms: string[];
    supervisionAndEnforcement: string[];
    flexibilityAndNationalDiscretion: string[];
    typicalGapsOrFailureModes: string[];
    implementationChallenges: string[];
    crossReferenceAndDependencies: string[];
    notesForReaders: string[];
  };
}

export interface FatfExecSummarySourceBlocksVM {
  bookId: string;
  blocks: FatfExecSummarySourceBlockVM[];
}

/* ======================================================
 * 어댑터 구현
 * ====================================================== */

/**
 * exec_summary_blocks.json → FatfExecSummarySourceBlocksVM
 * - JSON 스키마 전체를 타입으로 반영
 * - raw에 원본 그대로 보존
 * - view 편의를 위해 fatf_recommendation_cognitive_state를 camelCase로 평탄화
 */
export function adaptFatfRecommendationsExecSummaryBlocks(
  api: unknown
): FatfExecSummarySourceBlocksVM {
  if (!Array.isArray(api)) {
    throw new Error("Invalid payload: expected exec_summary_blocks array");
  }

  const blocksJson = api as FatfExecSummaryBlocksJson;

  if (blocksJson.length === 0) {
    throw new Error("Invalid payload: empty exec_summary_blocks array");
  }

  const first = blocksJson[0];
  const bookId = first.book_id;
  if (typeof bookId !== "string" || !bookId) {
    throw new Error("Invalid payload: book_id missing on first block");
  }

  const blocks: FatfExecSummarySourceBlockVM[] = blocksJson.map(
    (b: FatfExecSummaryBlockJson): FatfExecSummarySourceBlockVM => {
      if (!b.block_id) {
        throw new Error("Invalid block: block_id missing");
      }

      const stepj = b.stepj_doc;
      const cs = stepj.fatf_recommendation_cognitive_state;

      const coreMessage =
        typeof cs.core_message === "string" ? cs.core_message : "";

      const riskAndPolicyFocus = Array.isArray(cs.risk_and_policy_focus)
        ? cs.risk_and_policy_focus
        : [];

      const scopeAndCoverage = Array.isArray(cs.scope_and_coverage)
        ? cs.scope_and_coverage
        : [];

      const minimumRequiredMeasures = Array.isArray(
        cs.minimum_required_measures
      )
        ? cs.minimum_required_measures
        : [];

      const implementationMechanisms = Array.isArray(
        cs.implementation_mechanisms
      )
        ? cs.implementation_mechanisms
        : [];

      const supervisionAndEnforcement = Array.isArray(
        cs.supervision_and_enforcement
      )
        ? cs.supervision_and_enforcement
        : [];

      const flexibilityAndNationalDiscretion = Array.isArray(
        cs.flexibility_and_national_discretion
      )
        ? cs.flexibility_and_national_discretion
        : [];

      const typicalGapsOrFailureModes = Array.isArray(
        cs.typical_gaps_or_failure_modes
      )
        ? cs.typical_gaps_or_failure_modes
        : [];

      const implementationChallenges = Array.isArray(
        cs.implementation_challenges
      )
        ? cs.implementation_challenges
        : [];

      const crossReferenceAndDependencies = Array.isArray(
        cs.cross_reference_and_dependencies
      )
        ? cs.cross_reference_and_dependencies
        : [];

      const notesForReaders = Array.isArray(cs.notes_for_readers)
        ? cs.notes_for_readers
        : [];

      return {
        raw: b,

        blockId: b.block_id,
        bookId: b.book_id,
        sectionTitle: b.section_title,

        pageRange: {
          pageStart: b.page_range.page_start,
          pageEnd: b.page_range.page_end,
        },

        sourceSectionKeys: b.source_section_keys,

        cognitiveState: {
          coreMessage,
          riskAndPolicyFocus,
          scopeAndCoverage,
          minimumRequiredMeasures,
          implementationMechanisms,
          supervisionAndEnforcement,
          flexibilityAndNationalDiscretion,
          typicalGapsOrFailureModes,
          implementationChallenges,
          crossReferenceAndDependencies,
          notesForReaders,
        },
      };
    }
  );

  return {
    bookId,
    blocks,
  };
}

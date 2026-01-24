// law-frontend/app/strategy/Summary/adapters/NationalStrategyTaxCrimeBlocks.adapter.ts
// Designing_a_National_Strategy_against_Tax_Crime 전용 exec_summary_blocks 어댑터
// JSON 스키마를 그대로 타입으로 반영 + VM 변환

/* ======================================================
 * 원본 JSON 스키마 (exec_summary_blocks.json)
 * ====================================================== */

export interface NatPageRangeJson {
  page_start: number;
  page_end: number;
}

/* ---------- national_strategy_cognitive_state ---------- */

export interface NatAnalyticalAssetJson {
  label: string;
  description: string;
  typical_uses: string[];
}

export interface NatConstrainedThinkingJson {
  previous_pattern: string;
  why_limited: string;
  updated_criterion: string;
}

export interface NatLegitimateVariationJson {
  dimension: string;
  justification: string;
}

export interface NatDeferredPolicyQuestionJson {
  question: string;
  reason_for_deferral: string;
  expected_later_stage: string;
}

export interface NatNationalStrategyCognitiveStateJson {
  strategic_function: string;
  state_of_understanding: string;
  analytical_assets: NatAnalyticalAssetJson[];
  constrained_thinking: NatConstrainedThinkingJson[];
  legitimate_variations: NatLegitimateVariationJson[];
  deferred_policy_questions: NatDeferredPolicyQuestionJson[];
}

/* ---------- case_based_learning_state ---------- */

export interface NatCaseBasedJurisdictionContextJson {
  institutional_model: string;
  tax_crime_challenges: string[];
  why_relevant_to_readers: string;
}

export interface NatStrategyComponentInPracticeJson {
  component_label: string;
  description: string;
  linked_chapters: string[];
  purpose_in_case: string;
}

export interface NatImplementationPatternJson {
  pattern_label: string;
  mechanism: string;
  enabling_factors: string[];
  risks_if_copied_blindly: string;
}

export interface NatTransferableInsightJson {
  insight: string;
  why_generalizable: string;
  adaptation_questions: string[];
}

export interface NatCaseSpecificLimitJson {
  limit_description: string;
  country_specific_factors: string;
  implication_for_reader: string;
}

export interface NatCaseBasedLearningStateJson {
  jurisdiction_context: NatCaseBasedJurisdictionContextJson;
  strategy_components_in_practice: NatStrategyComponentInPracticeJson[];
  implementation_patterns: NatImplementationPatternJson[];
  transferable_insights: NatTransferableInsightJson[];
  case_specific_limits: NatCaseSpecificLimitJson[];
  cross_case_comparisons: any[];
}

/* ---------- StepJ 문서 & 블록 ---------- */

export interface NatStepJDocJson {
  book_id: string;
  section_title: string;
  page_range: NatPageRangeJson;
  section_key: string;

  national_strategy_cognitive_state?: NatNationalStrategyCognitiveStateJson;
  case_based_learning_state?: NatCaseBasedLearningStateJson;
}

export interface NatExecSummaryBlockJson {
  block_id: string;
  book_id: string;
  section_title: string;
  page_range: NatPageRangeJson;
  source_section_keys: string[];
  stepj_doc: NatStepJDocJson;
}

export type NatExecSummaryBlocksJson = NatExecSummaryBlockJson[];

/* ======================================================
 * VM 타입 (뷰 편의용 + 원본 보존)
 * ====================================================== */

export interface NatExecSummarySourceBlockVM {
  /** 원본 JSON 한 블록 전체 (정보 손실 없이 보존) */
  raw: NatExecSummaryBlockJson;

  /** 공통 메타 */
  blockId: string;
  bookId: string;
  sectionTitle: string;

  pageRange: {
    pageStart: number;
    pageEnd: number;
  };

  sourceSectionKeys: string[];

  /** StepJ: national_strategy_cognitive_state 가 있는 경우 */
  nationalStrategy?: {
    strategicFunction: string;
    stateOfUnderstanding: string;
    analyticalAssets: NatAnalyticalAssetJson[];
    constrainedThinking: NatConstrainedThinkingJson[];
    legitimateVariations: NatLegitimateVariationJson[];
    deferredPolicyQuestions: NatDeferredPolicyQuestionJson[];
  };

  /** StepJ: case_based_learning_state 가 있는 경우 */
  caseBasedLearning?: {
    jurisdictionContext: NatCaseBasedJurisdictionContextJson;
    strategyComponentsInPractice: NatStrategyComponentInPracticeJson[];
    implementationPatterns: NatImplementationPatternJson[];
    transferableInsights: NatTransferableInsightJson[];
    caseSpecificLimits: NatCaseSpecificLimitJson[];
    crossCaseComparisons: any[];
  };
}

export interface NatExecSummarySourceBlocksVM {
  bookId: string;
  blocks: NatExecSummarySourceBlockVM[];
}

/* ======================================================
 * 어댑터 구현
 * ====================================================== */

export function adaptNatExecSummaryBlocks(
  api: unknown
): NatExecSummarySourceBlocksVM {
  if (!Array.isArray(api)) {
    throw new Error("Invalid payload: expected exec_summary_blocks array");
  }

  const blocksJson = api as NatExecSummaryBlocksJson;

  if (blocksJson.length === 0) {
    throw new Error("Invalid payload: empty exec_summary_blocks array");
  }

  const first = blocksJson[0];
  const bookId = first.book_id;
  if (typeof bookId !== "string" || !bookId) {
    throw new Error("Invalid payload: book_id missing on first block");
  }

  const blocks: NatExecSummarySourceBlockVM[] = blocksJson.map(
    (b: NatExecSummaryBlockJson): NatExecSummarySourceBlockVM => {
      if (!b.block_id) {
        throw new Error("Invalid block: block_id missing");
      }

      const stepj = b.stepj_doc;
      const ns = stepj.national_strategy_cognitive_state;
      const cb = stepj.case_based_learning_state;

      const nationalStrategy =
        ns != null
          ? {
              strategicFunction: ns.strategic_function ?? "",
              stateOfUnderstanding: ns.state_of_understanding ?? "",
              analyticalAssets: Array.isArray(ns.analytical_assets)
                ? ns.analytical_assets
                : [],
              constrainedThinking: Array.isArray(ns.constrained_thinking)
                ? ns.constrained_thinking
                : [],
              legitimateVariations: Array.isArray(ns.legitimate_variations)
                ? ns.legitimate_variations
                : [],
              deferredPolicyQuestions: Array.isArray(
                ns.deferred_policy_questions
              )
                ? ns.deferred_policy_questions
                : [],
            }
          : undefined;

      const caseBasedLearning =
        cb != null
          ? {
              jurisdictionContext: cb.jurisdiction_context,
              strategyComponentsInPractice: Array.isArray(
                cb.strategy_components_in_practice
              )
                ? cb.strategy_components_in_practice
                : [],
              implementationPatterns: Array.isArray(
                cb.implementation_patterns
              )
                ? cb.implementation_patterns
                : [],
              transferableInsights: Array.isArray(cb.transferable_insights)
                ? cb.transferable_insights
                : [],
              caseSpecificLimits: Array.isArray(cb.case_specific_limits)
                ? cb.case_specific_limits
                : [],
              crossCaseComparisons: Array.isArray(cb.cross_case_comparisons)
                ? cb.cross_case_comparisons
                : [],
            }
          : undefined;

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

        nationalStrategy,
        caseBasedLearning,
      };
    }
  );

  return {
    bookId,
    blocks,
  };
}

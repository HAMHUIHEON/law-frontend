// law-frontend/app/strategy/Summary/adapters/FightingTaxCrime2ndEditionBlocks.adapter.ts
// Fighting_Tax_Crime-2nd_edition 전용 exec_summary_blocks 어댑터
// JSON 스키마를 그대로 타입으로 반영 + VM 변환

/* ======================================================
 * 원본 JSON 스키마 (exec_summary_blocks.json)
 * ====================================================== */

export interface FtcPageRangeJson {
  page_start: number;
  page_end: number;
}

/** ten_principle_cognitive_state.legal_requirements[*] */
export interface FtcTenPrincipleLegalRequirementJson {
  label: string;
  description: string;
  typical_legal_forms: string[];
}

/** ten_principle_cognitive_state.operational_elements[*] */
export interface FtcTenPrincipleOperationalElementJson {
  label: string;
  description: string;
  typical_mechanisms: string[];
}

/** ten_principle_cognitive_state.cooperation_dimensions[*] */
export interface FtcTenPrincipleCooperationDimensionJson {
  label: string;
  description: string;
  main_counterparties: string[];
}

/** ten_principle_cognitive_state.implementation_challenges[*] */
export interface FtcTenPrincipleImplementationChallengeJson {
  pattern: string;
  why_it_matters: string;
  book_suggested_responses: string[];
}

/** ten_principle_cognitive_state.case_highlights[*] */
export interface FtcTenPrincipleCaseHighlightJson {
  case_id: string;
  jurisdiction_or_context: string;
  what_it_shows: string;
}

/** StepJ: ten_principle_cognitive_state 전체 */
export interface FtcTenPrincipleCognitiveStateJson {
  core_message: string;
  policy_rationale: string[];
  cooperation_dimensions: FtcTenPrincipleCooperationDimensionJson[];
  legal_requirements: FtcTenPrincipleLegalRequirementJson[];
  operational_elements: FtcTenPrincipleOperationalElementJson[];
  implementation_challenges: FtcTenPrincipleImplementationChallengeJson[];
  case_highlights: FtcTenPrincipleCaseHighlightJson[];
  deferred_questions: string[];
}

/** StepJ 문서 전체 */
export interface FtcStepJDocJson {
  book_id: string;
  principle_number: number;
  principle_title: string;
  page_range: FtcPageRangeJson;
  /** 이 책에서는 section_key가 배열 */
  section_key: string[];
  ten_principle_cognitive_state: FtcTenPrincipleCognitiveStateJson;
}

/** exec_summary_blocks.json의 한 블록 */
export interface FtcExecSummaryBlockJson {
  block_id: string;
  book_id: string;
  section_title: string;
  page_range: FtcPageRangeJson;
  source_section_keys: string[];
  stepj_doc: FtcStepJDocJson;
}

/** exec_summary_blocks.json 루트: 블록 배열 */
export type FtcExecSummaryBlocksJson = FtcExecSummaryBlockJson[];

/* ======================================================
 * VM 타입 (뷰 편의용 + 원본 보존)
 * ====================================================== */

export interface FtcExecSummarySourceBlockVM {
  /** 원본 JSON 한 블록 전체 (정보 손실 없이 보존) */
  raw: FtcExecSummaryBlockJson;

  /** 공통 메타 */
  blockId: string;
  bookId: string;
  sectionTitle: string;

  principleNumber: number;
  principleTitle: string;

  pageRange: {
    pageStart: number;
    pageEnd: number;
  };

  sourceSectionKeys: string[];

  /** stepj_doc.section_key 그대로 노출 */
  sectionKey: string[];

  /** ten_principle_cognitive_state 전체를 편의용으로 평탄화 */
  tenPrinciple: {
    coreMessage: string;
    policyRationale: string[];

    cooperationDimensions: FtcTenPrincipleCooperationDimensionJson[];

    legalRequirements: FtcTenPrincipleLegalRequirementJson[];
    operationalElements: FtcTenPrincipleOperationalElementJson[];

    implementationChallenges: FtcTenPrincipleImplementationChallengeJson[];
    caseHighlights: FtcTenPrincipleCaseHighlightJson[];

    deferredQuestions: string[];
  };
}

export interface FtcExecSummarySourceBlocksVM {
  bookId: string;
  blocks: FtcExecSummarySourceBlockVM[];
}

/* ======================================================
 * 어댑터 구현
 * ====================================================== */

/**
 * exec_summary_blocks.json → FtcExecSummarySourceBlocksVM
 * - JSON 스키마 전체를 타입으로 반영
 * - raw에 원본 그대로 보존
 * - view 편의를 위해 ten_principle_cognitive_state만 camelCase로 평탄화
 */
export function adaptFightingTaxCrime2ndExecSummaryBlocks(
  api: unknown
): FtcExecSummarySourceBlocksVM {
  if (!Array.isArray(api)) {
    throw new Error("Invalid payload: expected exec_summary_blocks array");
  }

  const blocksJson = api as FtcExecSummaryBlocksJson;

  if (blocksJson.length === 0) {
    throw new Error("Invalid payload: empty exec_summary_blocks array");
  }

  const first = blocksJson[0];
  const bookId = first.book_id;
  if (typeof bookId !== "string" || !bookId) {
    throw new Error("Invalid payload: book_id missing on first block");
  }

  const blocks: FtcExecSummarySourceBlockVM[] = blocksJson.map(
    (b: FtcExecSummaryBlockJson): FtcExecSummarySourceBlockVM => {
      if (!b.block_id) {
        throw new Error("Invalid block: block_id missing");
      }

      const stepj = b.stepj_doc;
      const t = stepj.ten_principle_cognitive_state;

      if (!t) {
        throw new Error(
          `Invalid block ${b.block_id}: ten_principle_cognitive_state missing`
        );
      }

      const coreMessage =
        typeof t.core_message === "string" ? t.core_message : "";

      const policyRationale = Array.isArray(t.policy_rationale)
        ? t.policy_rationale
        : [];

      const cooperationDimensions = Array.isArray(t.cooperation_dimensions)
        ? t.cooperation_dimensions
        : [];

      const legalRequirements = Array.isArray(t.legal_requirements)
        ? t.legal_requirements
        : [];

      const operationalElements = Array.isArray(t.operational_elements)
        ? t.operational_elements
        : [];

      const implementationChallenges = Array.isArray(
        t.implementation_challenges
      )
        ? t.implementation_challenges
        : [];

      const caseHighlights = Array.isArray(t.case_highlights)
        ? t.case_highlights
        : [];

      const deferredQuestions = Array.isArray(t.deferred_questions)
        ? t.deferred_questions
        : [];

      return {
        raw: b,

        blockId: b.block_id,
        bookId: b.book_id,
        sectionTitle: b.section_title,

        principleNumber: stepj.principle_number,
        principleTitle: stepj.principle_title,

        pageRange: {
          pageStart: b.page_range.page_start,
          pageEnd: b.page_range.page_end,
        },

        sourceSectionKeys: b.source_section_keys,
        sectionKey: stepj.section_key,

        tenPrinciple: {
          coreMessage,
          policyRationale,
          cooperationDimensions,
          legalRequirements,
          operationalElements,
          implementationChallenges,
          caseHighlights,
          deferredQuestions,
        },
      };
    }
  );

  return {
    bookId,
    blocks,
  };
}

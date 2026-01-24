// law-frontend/app/strategy/Summary/adapters/BestPracticesBOBlocks.adapter.ts
// Best-Practices-Beneficial-Ownership-Legal-Persons 전용 exec_summary_blocks 어댑터
// JSON 스키마를 토시 하나 안 빼고 타입으로 반영

/* ======================================================
 * 원본 JSON 스키마 (exec_summary_blocks.json)
 * ====================================================== */

export interface BoPageRangeJson {
  page_start: number;
  page_end: number;
}

export interface BoBestPracticeJson {
  label: string;
  description: string;
  sub_points: string[];
}

export interface BoCountryExampleJson {
  country: string;
  summary: string;
  original_box_id: string | null;
}

export interface BoChallengeJson {
  pattern: string;
  response: string[];
}

export interface BoCognitiveModuleJson {
  core_messages: string[];
  policy_rationales: string[];
  best_practices: BoBestPracticeJson[];
  risk_factors: string[];
  implementation_measures: string[];
  international_references: string[];
  country_examples: BoCountryExampleJson[];
  challenges: BoChallengeJson[];
  deferred_issues: string[];
}

export interface BoStepJDocJson {
  book_id: string;
  section_title: string;
  page_range: BoPageRangeJson;
  source_section_keys: string[];
  bo_cognitive_module: BoCognitiveModuleJson;
}

export interface BoExecSummaryBlockJson {
  block_id: string;
  book_id: string;
  section_title: string;
  page_range: BoPageRangeJson;
  source_section_keys: string[];
  stepj_doc: BoStepJDocJson;
}

/** exec_summary_blocks.json 루트: 블록 배열 */
export type BoExecSummaryBlocksJson = BoExecSummaryBlockJson[];

/* ======================================================
 * VM 타입 (뷰 편의용 + 원본 보존)
 * ====================================================== */

export interface BoExecSummarySourceBlockVM {
  /** 원본 JSON 한 블록 전체 (정보 손실 없이 보존) */
  raw: BoExecSummaryBlockJson;

  /** 편의 필드들 */
  blockId: string;
  bookId: string;
  sectionTitle: string;

  pageRange: {
    pageStart: number;
    pageEnd: number;
  };

  sourceSectionKeys: string[];

  coreMessages: string[];
  policyRationales: string[];
  bestPractices: BoBestPracticeJson[];
  riskFactors: string[];
  implementationMeasures: string[];
  internationalReferences: string[];
  countryExamples: BoCountryExampleJson[];
  challenges: BoChallengeJson[];
  deferredIssues: string[];
}

export interface BoExecSummarySourceBlocksVM {
  bookId: string;
  blocks: BoExecSummarySourceBlockVM[];
}

/* ======================================================
 * 어댑터 구현
 * ====================================================== */

/**
 * exec_summary_blocks.json → BoExecSummarySourceBlocksVM
 * - JSON 스키마 전체를 타입으로 반영
 * - raw에 원본 그대로 보존
 */
export function adaptBoExecSummaryBlocks(
  api: unknown
): BoExecSummarySourceBlocksVM {
  if (!Array.isArray(api)) {
    throw new Error("Invalid payload: expected exec_summary_blocks array");
  }

  const blocksJson = api as BoExecSummaryBlocksJson;

  if (blocksJson.length === 0) {
    throw new Error("Invalid payload: empty exec_summary_blocks array");
  }

  const first = blocksJson[0];
  const bookId = first.book_id;

    // ✅ 이 가드 추가
  if (bookId !== "Best-Practices-Beneficial-Ownership-Legal-Persons") {
    throw new Error("BO adapter called with non-BO book");
  }
  
  if (typeof bookId !== "string" || !bookId) {
    throw new Error("Invalid payload: book_id missing on first block");
  }

  const blocks: BoExecSummarySourceBlockVM[] = blocksJson.map(
    (b: BoExecSummaryBlockJson): BoExecSummarySourceBlockVM => {
      const cm = b.stepj_doc.bo_cognitive_module;

      const coreMessages = Array.isArray(cm.core_messages)
        ? cm.core_messages
        : [];

      const policyRationales = Array.isArray(cm.policy_rationales)
        ? cm.policy_rationales
        : [];

      const bestPractices = Array.isArray(cm.best_practices)
        ? cm.best_practices
        : [];

      const riskFactors = Array.isArray(cm.risk_factors)
        ? cm.risk_factors
        : [];

      const implementationMeasures = Array.isArray(
        cm.implementation_measures
      )
        ? cm.implementation_measures
        : [];

      const internationalReferences = Array.isArray(
        cm.international_references
      )
        ? cm.international_references
        : [];

      const countryExamples = Array.isArray(cm.country_examples)
        ? cm.country_examples
        : [];

      const challenges = Array.isArray(cm.challenges) ? cm.challenges : [];

      const deferredIssues = Array.isArray(cm.deferred_issues)
        ? cm.deferred_issues
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

        coreMessages,
        policyRationales,
        bestPractices,
        riskFactors,
        implementationMeasures,
        internationalReferences,
        countryExamples,
        challenges,
        deferredIssues,
      };
    }
  );

  return {
    bookId,
    blocks,
  };
}

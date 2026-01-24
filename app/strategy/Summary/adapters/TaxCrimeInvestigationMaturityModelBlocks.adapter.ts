// law-frontend/app/strategy/Summary/adapters/TaxCrimeInvestigationMaturityModelBlocks.adapter.ts
// tax-crime-investigation-maturity-model 전용 exec_summary_blocks 어댑터
// 이 파일의 JSON 스키마 100% 반영

/* ======================================================
 * 원본 JSON 스키마 (exec_summary_blocks.json)
 * ====================================================== */

export interface TciMmPageRangeJson {
  page_start: number;
  page_end: number;
}

/** stepj_doc.maturity_model_cognitive_state 전체 */
export interface TciMmMaturityModelCognitiveStateJson {
  core_message: string;
  state_of_understanding: string[];

  /** 옵션 필드들 (블록마다 존재 여부 다름) */
  requirements?: string[];
  operational_elements?: string[];
  implementation_measures?: string[];
  risk_factors?: string[];
  design_options?: string[];
  legitimate_variations?: string[];
  deferred_questions?: string[];
  notes_for_self_assessment?: string[];
}

/** stepj_doc 전체 */
export interface TciMmStepJDocJson {
  book_id: string;
  section_title: string;
  page_range: TciMmPageRangeJson;
  section_key: string;
  source_section_keys: string[];
  maturity_model_cognitive_state: TciMmMaturityModelCognitiveStateJson;
}

/** exec_summary_blocks.json의 한 블록 */
export interface TciMmExecSummaryBlockJson {
  block_id: string;
  book_id: string;
  section_title: string;
  page_range: TciMmPageRangeJson;
  source_section_keys: string[];
  stepj_doc: TciMmStepJDocJson;
}

/** exec_summary_blocks.json 루트: 블록 배열 */
export type TciMmExecSummaryBlocksJson = TciMmExecSummaryBlockJson[];

/* ======================================================
 * VM 타입 (뷰 편의용 + 원본 보존)
 * ====================================================== */

export interface TciMmExecSummarySourceBlockVM {
  /** 원본 JSON 한 블록 전체 (정보 손실 없이 보존) */
  raw: TciMmExecSummaryBlockJson;

  /** 공통 메타 */
  blockId: string;
  bookId: string;
  sectionTitle: string;

  pageRange: {
    pageStart: number;
    pageEnd: number;
  };

  /** top-level source_section_keys */
  sourceSectionKeys: string[];

  /** stepj_doc.section_key + stepj_doc.source_section_keys */
  stepJSectionKey: string;
  stepJSourceSectionKeys: string[];

  /** maturity_model_cognitive_state를 JSON 키 그대로 노출 */
  maturityModel: TciMmMaturityModelCognitiveStateJson;
}

export interface TciMmExecSummarySourceBlocksVM {
  bookId: string;
  blocks: TciMmExecSummarySourceBlockVM[];
}

/* ======================================================
 * 어댑터 구현
 * ====================================================== */

/**
 * exec_summary_blocks.json → TciMmExecSummarySourceBlocksVM
 * - 이 책 JSON 스키마만 기준으로 1:1 매핑
 * - raw에 원본 그대로 보존
 */
export function adaptTciMmExecSummaryBlocks(
  api: unknown
): TciMmExecSummarySourceBlocksVM {
  if (!Array.isArray(api)) {
    throw new Error("Invalid payload: expected exec_summary_blocks array");
  }

  const blocksJson = api as TciMmExecSummaryBlocksJson;

  if (blocksJson.length === 0) {
    throw new Error("Invalid payload: empty exec_summary_blocks array");
  }

  const first = blocksJson[0];
  const bookId = first.book_id;
  if (typeof bookId !== "string" || !bookId) {
    throw new Error("Invalid payload: book_id missing on first block");
  }

  const blocks: TciMmExecSummarySourceBlockVM[] = blocksJson.map(
    (b: TciMmExecSummaryBlockJson): TciMmExecSummarySourceBlockVM => {
      if (!b.block_id) {
        throw new Error("Invalid block: block_id missing");
      }

      const stepj = b.stepj_doc;
      const m = stepj.maturity_model_cognitive_state;

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
        stepJSectionKey: stepj.section_key,
        stepJSourceSectionKeys: stepj.source_section_keys,

        // JSON에 있는 모든 키를 그대로 들고 간다
        maturityModel: m,
      };
    }
  );

  return {
    bookId,
    blocks,
  };
}

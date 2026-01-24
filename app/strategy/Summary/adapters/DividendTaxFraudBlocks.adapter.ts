// law-frontend/app/strategy/Summary/adapters/DividendTaxFraudBlocks.adapter.ts
// dividend_tax_fraud 전용 exec_summary_blocks 어댑터
// JSON 스키마를 그대로 타입으로 반영 + VM 변환

/* ======================================================
 * 원본 JSON 스키마 (exec_summary_blocks.json)
 * ====================================================== */

export interface DtfPageRangeJson {
  page_start: number;
  page_end: number;
}

/** oecd_report_cognitive_state.requirements[*] */
export interface DtfRequirementJson {
  label: string;
  description: string;
  sub_points: string[];
}

/** oecd_report_cognitive_state.operational_elements[*] */
export interface DtfOperationalElementJson {
  label: string;
  description: string;
  sub_points: string[];
}

/** oecd_report_cognitive_state.cooperation_dimensions[*] */
export interface DtfCooperationDimensionJson {
  label: string;
  description: string;
  sub_points: string[];
}

/** oecd_report_cognitive_state.implementation_challenges[*] */
export interface DtfImplementationChallengeJson {
  pattern: string;
  why_it_matters: string;
  response: string[];
}

/** StepJ: oecd_report_cognitive_state 전체 */
export interface DtfOecdReportCognitiveStateJson {
  core_message: string;
  key_findings: string[];
  mechanisms: string[];
  risk_factors: string[];
  requirements: DtfRequirementJson[];
  operational_elements: DtfOperationalElementJson[];
  cooperation_dimensions: DtfCooperationDimensionJson[];
  implementation_measures: string[];
  recommended_actions: string[];
  implementation_challenges: DtfImplementationChallengeJson[];
  deferred_questions: any[];
  evidence_anchors: string[];
}

/** StepJ 문서 전체 */
export interface DtfStepJDocJson {
  book_id: string;
  section_title: string;
  page_range: DtfPageRangeJson;
  source_section_keys: string[];
  oecd_report_cognitive_state: DtfOecdReportCognitiveStateJson;
}

/** exec_summary_blocks.json의 한 블록 */
export interface DtfExecSummaryBlockJson {
  block_id: string;
  book_id: string;
  section_title: string;
  page_range: DtfPageRangeJson;
  source_section_keys: string[];
  stepj_doc: DtfStepJDocJson;
}

/** exec_summary_blocks.json 루트: 블록 배열 */
export type DtfExecSummaryBlocksJson = DtfExecSummaryBlockJson[];

/* ======================================================
 * VM 타입 (뷰 편의용 + 원본 보존)
 * ====================================================== */

export interface DtfExecSummarySourceBlockVM {
  /** 원본 JSON 한 블록 전체 (정보 손실 없이 보존) */
  raw: DtfExecSummaryBlockJson;

  /** 공통 메타 */
  blockId: string;
  bookId: string;
  sectionTitle: string;

  pageRange: {
    pageStart: number;
    pageEnd: number;
  };

  sourceSectionKeys: string[];

  /**
   * StepJ: oecd_report_cognitive_state
   * - JSON 키/구조 그대로 유지
   */
  oecd_report_cognitive_state: DtfOecdReportCognitiveStateJson;
}

export interface DtfExecSummarySourceBlocksVM {
  bookId: string;
  blocks: DtfExecSummarySourceBlockVM[];
}

/* ======================================================
 * 어댑터 구현
 * ====================================================== */

/**
 * dividend_tax_fraud
 * exec_summary_blocks.json → DtfExecSummarySourceBlocksVM
 */
export function adaptDtfExecSummaryBlocks(
  api: unknown
): DtfExecSummarySourceBlocksVM {
  if (!Array.isArray(api)) {
    throw new Error("Invalid payload: expected exec_summary_blocks array");
  }

  const blocksJson = api as DtfExecSummaryBlocksJson;

  if (blocksJson.length === 0) {
    throw new Error("Invalid payload: empty exec_summary_blocks array");
  }

  const first = blocksJson[0];
  const bookId = first.book_id;
  if (typeof bookId !== "string" || !bookId) {
    throw new Error("Invalid payload: book_id missing on first block");
  }

  const blocks: DtfExecSummarySourceBlockVM[] = blocksJson.map(
    (b: DtfExecSummaryBlockJson): DtfExecSummarySourceBlockVM => {
      if (!b.block_id) {
        throw new Error("Invalid block: block_id missing");
      }

      const stepj = b.stepj_doc;
      const oecd = stepj.oecd_report_cognitive_state;

      if (!oecd) {
        throw new Error(
          `Invalid block ${b.block_id}: oecd_report_cognitive_state missing`
        );
      }

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

        // JSON 그대로 보존
        oecd_report_cognitive_state: oecd,
      };
    }
  );

  return {
    bookId,
    blocks,
  };
}

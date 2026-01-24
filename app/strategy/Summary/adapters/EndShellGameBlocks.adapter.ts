// law-frontend/app/strategy/Summary/adapters/EndShellGameBlocks.adapter.ts
// "end shell game" 전용 exec_summary_blocks 어댑터
// JSON 스키마를 그대로 타입으로 반영 + VM 변환

/* ======================================================
 * 원본 JSON 스키마 (exec_summary_blocks.json)
 * ====================================================== */

export interface EsgPageRangeJson {
  page_start: number;
  page_end: number;
}

/** oecd_report_cognitive_state.requirements[*] */
export interface EsgRequirementJson {
  label: string;
  description: string;
  sub_points: string[];
}

/** oecd_report_cognitive_state.operational_elements[*] */
export interface EsgOperationalElementJson {
  label: string;
  description: string;
  sub_points: string[];
}

/** oecd_report_cognitive_state.cooperation_dimensions[*] */
export interface EsgCooperationDimensionJson {
  label: string;
  description: string;
  sub_points: string[];
}

/** oecd_report_cognitive_state.implementation_challenges[*] */
export interface EsgImplementationChallengeJson {
  pattern: string;
  why_it_matters: string;
  response: string[];
}

/** StepJ: oecd_report_cognitive_state 전체 */
export interface EsgOecdReportCognitiveStateJson {
  core_message: string;
  key_findings: string[];
  mechanisms: string[];
  risk_factors: string[];
  requirements: EsgRequirementJson[];
  operational_elements: EsgOperationalElementJson[];
  cooperation_dimensions: EsgCooperationDimensionJson[];
  implementation_measures: string[];
  recommended_actions: string[];
  implementation_challenges: EsgImplementationChallengeJson[];
  deferred_questions: string[];
  evidence_anchors: string[];
}

/** StepJ 문서 전체 */
export interface EsgStepJDocJson {
  book_id: string;
  section_title: string;
  page_range: EsgPageRangeJson;
  source_section_keys: string[];
  oecd_report_cognitive_state: EsgOecdReportCognitiveStateJson;
}

/** exec_summary_blocks.json의 한 블록 */
export interface EsgExecSummaryBlockJson {
  block_id: string;
  book_id: string;
  section_title: string;
  page_range: EsgPageRangeJson;
  source_section_keys: string[];
  stepj_doc: EsgStepJDocJson;
}

/** exec_summary_blocks.json 루트: 블록 배열 */
export type EsgExecSummaryBlocksJson = EsgExecSummaryBlockJson[];

/* ======================================================
 * VM 타입 (뷰 편의용 + 원본 보존)
 * ====================================================== */

export interface EsgExecSummarySourceBlockVM {
  /** 원본 JSON 한 블록 전체 (정보 손실 없이 보존) */
  raw: EsgExecSummaryBlockJson;

  /** 공통 메타 */
  blockId: string;
  bookId: string;
  sectionTitle: string;

  pageRange: {
    pageStart: number;
    pageEnd: number;
  };

  sourceSectionKeys: string[];

  /** oecd_report_cognitive_state 평탄화 */
  oecdReportCognitiveState: {
    coreMessage: string;
    keyFindings: string[];
    mechanisms: string[];
    riskFactors: string[];

    requirements: EsgRequirementJson[];
    operationalElements: EsgOperationalElementJson[];
    cooperationDimensions: EsgCooperationDimensionJson[];

    implementationMeasures: string[];
    recommendedActions: string[];
    implementationChallenges: EsgImplementationChallengeJson[];

    deferredQuestions: string[];
    evidenceAnchors: string[];
  };
}

export interface EsgExecSummarySourceBlocksVM {
  bookId: string;
  blocks: EsgExecSummarySourceBlockVM[];
}

/* ======================================================
 * 어댑터 구현
 * ====================================================== */

/**
 * exec_summary_blocks.json → EsgExecSummarySourceBlocksVM
 * - JSON 스키마 전체를 타입으로 반영
 * - raw에 원본 그대로 보존
 * - view 편의를 위해 oecd_report_cognitive_state를 camelCase로 평탄화
 */
export function adaptEndShellGameExecSummaryBlocks(
  api: unknown
): EsgExecSummarySourceBlocksVM {
  if (!Array.isArray(api)) {
    throw new Error("Invalid payload: expected exec_summary_blocks array");
  }

  const blocksJson = api as EsgExecSummaryBlocksJson;

  if (blocksJson.length === 0) {
    throw new Error("Invalid payload: empty exec_summary_blocks array");
  }

  const first = blocksJson[0];
  const bookId = first.book_id;
  if (typeof bookId !== "string" || !bookId) {
    throw new Error("Invalid payload: book_id missing on first block");
  }

  const blocks: EsgExecSummarySourceBlockVM[] = blocksJson.map(
    (b: EsgExecSummaryBlockJson): EsgExecSummarySourceBlockVM => {
      if (!b.block_id) {
        throw new Error("Invalid block: block_id missing");
      }

      const stepj = b.stepj_doc;
      const s = stepj.oecd_report_cognitive_state;

      const coreMessage =
        typeof s.core_message === "string" ? s.core_message : "";

      const keyFindings = Array.isArray(s.key_findings)
        ? s.key_findings
        : [];

      const mechanisms = Array.isArray(s.mechanisms) ? s.mechanisms : [];

      const riskFactors = Array.isArray(s.risk_factors)
        ? s.risk_factors
        : [];

      const requirements = Array.isArray(s.requirements)
        ? s.requirements
        : [];

      const operationalElements = Array.isArray(s.operational_elements)
        ? s.operational_elements
        : [];

      const cooperationDimensions = Array.isArray(s.cooperation_dimensions)
        ? s.cooperation_dimensions
        : [];

      const implementationMeasures = Array.isArray(s.implementation_measures)
        ? s.implementation_measures
        : [];

      const recommendedActions = Array.isArray(s.recommended_actions)
        ? s.recommended_actions
        : [];

      const implementationChallenges = Array.isArray(
        s.implementation_challenges
      )
        ? s.implementation_challenges
        : [];

      const deferredQuestions = Array.isArray(s.deferred_questions)
        ? s.deferred_questions
        : [];

      const evidenceAnchors = Array.isArray(s.evidence_anchors)
        ? s.evidence_anchors
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

        oecdReportCognitiveState: {
          coreMessage,
          keyFindings,
          mechanisms,
          riskFactors,
          requirements,
          operationalElements,
          cooperationDimensions,
          implementationMeasures,
          recommendedActions,
          implementationChallenges,
          deferredQuestions,
          evidenceAnchors,
        },
      };
    }
  );

  return {
    bookId,
    blocks,
  };
}

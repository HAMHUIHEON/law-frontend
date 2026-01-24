// law-frontend/app/strategy/Summary/adapters/TaxCrimeInvestigationManualBlocks.adapter.ts
// Designing_a_tax_crime_investigation_manual 전용 exec_summary_blocks 어댑터
// ✅ JSON 스키마를 그대로 타입으로 반영 + VM 변환 (키 이름 1:1 유지)

/* ======================================================
 * 원본 JSON 스키마 (exec_summary_blocks.json)
 * ====================================================== */

export interface TcimPageRangeJson {
  page_start: number;
  page_end: number;
}

/** module_design_state.must_have_subsections_in_manual[*] */
export interface TcimMustHaveSubsectionInManualJson {
  name: string;
  purpose: string;
  typical_content: string[];
}

/** module_design_state.key_procedures_or_decision_flows[*] */
export interface TcimKeyProcedureOrDecisionFlowJson {
  label: string;
  description: string;
  trigger_or_entry_conditions?: string[];
  main_steps?: string[];
  outputs_or_decisions?: string[];
}

/** module_design_state.internal_stakeholders_and_responsibilities[*] */
export interface TcimInternalStakeholderJson {
  actor: string;
  responsibilities: string[];
  typical_points_of_interaction: string[];
}

/** module_design_state.external_stakeholders_and_interfaces[*] */
export interface TcimExternalStakeholderJson {
  counterpart: string;
  purpose: string;
  information_exchanged: string[];
  coordination_risks: string[];
}

/** module_design_state.legitimate_national_variations[*] */
export interface TcimLegitimateNationalVariationJson {
  dimension: string;
  justification: string;
}

/** module_design_state.risks_if_module_is_weak_or_missing[*] */
export interface TcimRiskIfModuleIsWeakJson {
  risk_description: string;
  typical_failure_modes: string[];
  downstream_consequences: string[];
}

/** module_design_state.deferred_policy_questions[*] */
export interface TcimDeferredPolicyQuestionJson {
  question: string;
  reason_for_deferral: string;
  expected_decision_forum: string;
}

/** StepJ: module_design_state 전체 (JSON 키 그대로) */
export interface TcimModuleDesignStateJson {
  module_role_in_investigation_lifecycle: string;
  operational_objectives_for_module: string[];
  must_have_subsections_in_manual: TcimMustHaveSubsectionInManualJson[];
  key_procedures_or_decision_flows: TcimKeyProcedureOrDecisionFlowJson[];
  internal_stakeholders_and_responsibilities: TcimInternalStakeholderJson[];
  external_stakeholders_and_interfaces: TcimExternalStakeholderJson[];
  legitimate_national_variations: TcimLegitimateNationalVariationJson[];
  risks_if_module_is_weak_or_missing: TcimRiskIfModuleIsWeakJson[];
  deferred_policy_questions: TcimDeferredPolicyQuestionJson[];
}

/** StepJ 문서 전체 */
export interface TcimStepJDocJson {
  book_id: string;
  section_title: string;
  page_range: TcimPageRangeJson;
  /** TCIM에서는 section_key가 배열 */
  section_key: string[];
  module_design_state: TcimModuleDesignStateJson;
}

/** exec_summary_blocks.json의 한 블록 */
export interface TcimExecSummaryBlockJson {
  block_id: string;
  book_id: string;
  section_title: string;
  page_range: TcimPageRangeJson;
  source_section_keys: string[];
  stepj_doc: TcimStepJDocJson;
}

/** exec_summary_blocks.json 루트: 블록 배열 */
export type TcimExecSummaryBlocksJson = TcimExecSummaryBlockJson[];

/* ======================================================
 * VM 타입 (뷰 편의용 + 원본 보존)
 * ====================================================== */

export interface TcimExecSummarySourceBlockVM {
  /** 원본 JSON 한 블록 전체 (정보 손실 없이 보존) */
  raw: TcimExecSummaryBlockJson;

  /** 공통 메타 (뷰에서 바로 쓰기 좋게 중복 노출) */
  blockId: string;
  bookId: string;
  sectionTitle: string;

  pageRange: {
    pageStart: number;
    pageEnd: number;
  };

  sourceSectionKeys: string[];

  /**
   * module_design_state 그대로 노출
   * - 키 이름도 JSON과 완전히 동일하게 유지
   */
  module_design_state: TcimModuleDesignStateJson;
}

export interface TcimExecSummarySourceBlocksVM {
  bookId: string;
  blocks: TcimExecSummarySourceBlockVM[];
}

/* ======================================================
 * 어댑터 구현
 * ====================================================== */

/**
 * Designing_a_tax_crime_investigation_manual
 * exec_summary_blocks.json → TcimExecSummarySourceBlocksVM
 * - JSON 스키마 전체를 타입으로 반영
 * - raw에 원본 그대로 보존
 * - module_design_state 키/구조를 1:1 유지
 */
export function adaptTcimExecSummaryBlocks(
  api: unknown
): TcimExecSummarySourceBlocksVM {
  if (!Array.isArray(api)) {
    throw new Error("Invalid payload: expected exec_summary_blocks array");
  }

  const blocksJson = api as TcimExecSummaryBlocksJson;

  if (blocksJson.length === 0) {
    throw new Error("Invalid payload: empty exec_summary_blocks array");
  }

  const first = blocksJson[0];
  const bookId = first.book_id;
  if (typeof bookId !== "string" || !bookId) {
    throw new Error("Invalid payload: book_id missing on first block");
  }

  const blocks: TcimExecSummarySourceBlockVM[] = blocksJson.map(
    (b: TcimExecSummaryBlockJson): TcimExecSummarySourceBlockVM => {
      if (!b.block_id) {
        throw new Error("Invalid block: block_id missing");
      }

      const stepj = b.stepj_doc;

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

        // JSON 그대로 붙여넣기 (키/구조 변경 없음)
        module_design_state: stepj.module_design_state,
      };
    }
  );

  return {
    bookId,
    blocks,
  };
}

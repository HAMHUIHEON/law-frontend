// law-frontend/app/strategy/JU/adapters/JudgementUnits.adapter.ts
// TPG_2022 judgement_units_with_block_id 전용 어댑터
// JSON 스키마를 그대로 타입으로 반영 + VM 변환

/* ======================================================
 * 원본 JSON 스키마 (judgement_units_with_block_id/*.json)
 * ====================================================== */

export interface JuSourcePagesJson {
  page_start: number;
  page_end: number;
}

/** mandatory_concepts[*] */
export interface JuMandatoryConceptJson {
  term: string;
  definition: string;
  why_it_matters?: string;
  common_misunderstanding?: string;
  [key: string]: unknown;
}

/** decision_flow[*] */
export interface JuDecisionFlowStepJson {
  step?: number;
  question?: string;
  yes_leads_to?: string;
  no_leads_to?: string;
  stop_if?: string;
  [key: string]: unknown;
}

/** navigation.*[*] 공통 구조 */
export interface JuNavigationLinkJson {
  chapter?: string;
  section?: string;
  title?: string;
  page_start?: number;
  page_end?: number;
  reason?: string;
  [key: string]: unknown;
}

/** navigation 전체 (키는 예시 + 확장 가능) */
export interface JuNavigationJson {
  related_safe_harbours?: JuNavigationLinkJson[];
  [key: string]: unknown;
}


/** boundaries */
export interface JuBoundariesJson {
  not_a_rule?: string;
  depends_on?: string[];
  tp_risk_note?: string;
  [key: string]: unknown;
}

/** judgement_units_with_block_id 안의 한 파일(JSON) */
export interface JudgementUnitJson {
  block_id: string;
  judgement_id?: string;
  section_key?: string;
  title?: string;
  source_pages?: JuSourcePagesJson;

  core_question?: string;
  why_this_exists?: string;
  mandatory_concepts?: JuMandatoryConceptJson[];
  decision_flow?: JuDecisionFlowStepJson[];
  navigation?: JuNavigationJson;
  boundaries?: JuBoundariesJson;

  [key: string]: unknown;
}

/** API 루트: /api/strategy/{book_id}/mju_blocks */
export interface JudgementUnitsApiResponse {
  book_id: string;
  judgement_units: JudgementUnitJson[];
  [key: string]: unknown;
}

/* ======================================================
 * VM 타입 (뷰 편의용 + 원본 보존)
 * ====================================================== */

export interface JudgementUnitVM {
  /** 원본 JSON 전체 (정보 손실 없이 보존) */
  raw: JudgementUnitJson;

  /** 공통 메타 */
  blockId: string;
  bookId: string;
  judgementId: string | null;
  sectionKey: string | null;
  title: string;

  pageRange: {
    pageStart: number | null;
    pageEnd: number | null;
  };

  /** 소제목들(원본 필드명 그대로) */
  core_question: string | null;
  why_this_exists: string | null;
  mandatory_concepts: JuMandatoryConceptJson[];
  decision_flow: JuDecisionFlowStepJson[];
  navigation: JuNavigationJson | null;
  boundaries: JuBoundariesJson | null;
}

export interface JudgementUnitsVM {
  bookId: string;
  blocks: JudgementUnitVM[];
  byBlockId: Record<string, JudgementUnitVM>;
  byJudgementId: Record<string, JudgementUnitVM>;
  bySectionKey: Record<string, JudgementUnitVM>;
}

/* ======================================================
 * 어댑터 구현
 * ====================================================== */

function ensureArrayOfJudgementUnits(api: unknown): JudgementUnitsApiResponse {
  if (!api || typeof api !== "object") {
    throw new Error("Invalid payload: expected object with judgement_units");
  }

  const obj = api as JudgementUnitsApiResponse;

  if (!Array.isArray(obj.judgement_units)) {
    throw new Error("Invalid payload: 'judgement_units' array is missing");
  }

  if (typeof obj.book_id !== "string" || !obj.book_id) {
    throw new Error("Invalid payload: 'book_id' is missing");
  }

  return obj;
}

function sortByBlockId(a: JudgementUnitVM, b: JudgementUnitVM): number {
  const ak = a.blockId;
  const bk = b.blockId;
  return ak.localeCompare(bk, "en", { numeric: true });
}

/**
 * /api/strategy/{book_id}/mju_blocks 응답 → JudgementUnitsVM
 * - 원본 JSON은 vm.raw에 그대로 보존
 * - block_id 기준으로 정렬된 blocks 배열 제공
 * - block_id / judgement_id / section_key 인덱스 제공
 */
export function adaptJudgementUnitsFromApi(api: unknown): JudgementUnitsVM {
  const payload = ensureArrayOfJudgementUnits(api);
  const { book_id, judgement_units } = payload;

  if (judgement_units.length === 0) {
    return {
      bookId: book_id,
      blocks: [],
      byBlockId: {},
      byJudgementId: {},
      bySectionKey: {},
    };
  }

  const blocks: JudgementUnitVM[] = judgement_units.map(
    (ju: JudgementUnitJson): JudgementUnitVM => {
      if (!ju.block_id || typeof ju.block_id !== "string") {
        throw new Error("Invalid judgement_unit: block_id missing");
      }

      const pageStart =
        ju.source_pages && typeof ju.source_pages.page_start === "number"
          ? ju.source_pages.page_start
          : null;
      const pageEnd =
        ju.source_pages && typeof ju.source_pages.page_end === "number"
          ? ju.source_pages.page_end
          : null;

      const core_question =
        typeof ju.core_question === "string" && ju.core_question.trim()
          ? ju.core_question
          : null;

      const why_this_exists =
        typeof ju.why_this_exists === "string" && ju.why_this_exists.trim()
          ? ju.why_this_exists
          : null;

      const mandatory_concepts: JuMandatoryConceptJson[] = Array.isArray(
        ju.mandatory_concepts
      )
        ? ju.mandatory_concepts
        : [];

      const decision_flow: JuDecisionFlowStepJson[] = Array.isArray(
        ju.decision_flow
      )
        ? ju.decision_flow
        : [];

      const navigation: JuNavigationJson | null =
        ju.navigation && typeof ju.navigation === "object"
          ? (ju.navigation as JuNavigationJson)
          : null;

      const boundaries: JuBoundariesJson | null =
        ju.boundaries && typeof ju.boundaries === "object"
          ? (ju.boundaries as JuBoundariesJson)
          : null;

      return {
        raw: ju,

        blockId: ju.block_id,
        bookId: book_id,
        judgementId:
          typeof ju.judgement_id === "string" && ju.judgement_id.trim()
            ? ju.judgement_id
            : null,
        sectionKey:
          typeof ju.section_key === "string" && ju.section_key.trim()
            ? ju.section_key
            : null,
        title:
          typeof ju.title === "string" && ju.title.trim() ? ju.title : "",

        pageRange: {
          pageStart,
          pageEnd,
        },

        core_question,
        why_this_exists,
        mandatory_concepts,
        decision_flow,
        navigation,
        boundaries,
      };
    }
  );

  blocks.sort(sortByBlockId);

  const byBlockId: Record<string, JudgementUnitVM> = {};
  const byJudgementId: Record<string, JudgementUnitVM> = {};
  const bySectionKey: Record<string, JudgementUnitVM> = {};

  for (const b of blocks) {
    if (!byBlockId[b.blockId]) {
      byBlockId[b.blockId] = b;
    }

    if (b.judgementId && !byJudgementId[b.judgementId]) {
      byJudgementId[b.judgementId] = b;
    }

    if (b.sectionKey && !bySectionKey[b.sectionKey]) {
      bySectionKey[b.sectionKey] = b;
    }
  }

  return {
    bookId: book_id,
    blocks,
    byBlockId,
    byJudgementId,
    bySectionKey,
  };
}

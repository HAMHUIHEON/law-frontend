// law-frontend/app/strategy/Summary/adapters/Pillar2Blocks.adapter.ts
// pillar2 전용 exec_summary_blocks 어댑터
// JSON 스키마를 그대로 타입으로 반영 + VM 변환

/* ======================================================
 * 원본 JSON 스키마 (exec_summary_blocks.json)
 * ====================================================== */

export interface Pillar2PageRangeJson {
  page_start: number;
  page_end: number;
}

/** pillar2_cognitive_state.key_concepts[*] */
export interface Pillar2KeyConceptJson {
  label: string;
  description: string;
}

/** pillar2_cognitive_state.main_rules[*] */
export interface Pillar2MainRuleJson {
  label: string;
  description: string;
  conditions: string[];
  outcomes: string[];
}

/** pillar2_cognitive_state.quantitative_parameters[*] */
export interface Pillar2QuantitativeParameterJson {
  name: string;
  description: string;
  default_value_or_threshold: string;
  notes: string[];
}

/** pillar2_cognitive_state.interactions_and_dependencies[*] */
export interface Pillar2InteractionOrDependencyJson {
  related_section_or_article: string;
  description: string;
}

/** pillar2_cognitive_state.implementation_challenges[*] */
export interface Pillar2ImplementationChallengeJson {
  topic: string;
  risks_if_ignored: string;
  book_guidance: string[];
}

/** pillar2_cognitive_state.elections_and_safe_harbours[*] */
export interface Pillar2ElectionOrSafeHarbourJson {
  label: string;
  description: string;
  who_can_use: string;
  conditions: string[];
  effects: string[];
}

/** stepj_doc.definitions[*] */
export interface Pillar2DefinitionJson {
  term: string;
  definition: string;
  cross_references: string[];
  related_terms: string[];
  notes: string[];
}

/** StepJ: pillar2_cognitive_state 전체 (JSON 키 그대로) */
export interface Pillar2CognitiveStateJson {
  structural_role: string;
  core_message: string;
  key_concepts: Pillar2KeyConceptJson[];
  main_rules: Pillar2MainRuleJson[];
  quantitative_parameters: Pillar2QuantitativeParameterJson[];
  interactions_and_dependencies: Pillar2InteractionOrDependencyJson[];
  implementation_challenges: Pillar2ImplementationChallengeJson[];
  elections_and_safe_harbours: Pillar2ElectionOrSafeHarbourJson[];
  open_policy_questions: string[];
}

/** StepJ 문서 전체 */
export interface Pillar2StepJDocJson {
  book_id: string;
  section_title: string;
  page_range: Pillar2PageRangeJson;
  source_section_keys: string[];

  /** 대부분 섹션에 존재, Definitions 블록(B010)에서는 없음 */
  section_number?: number;

  /** 일반 섹션에서 사용 */
  pillar2_cognitive_state?: Pillar2CognitiveStateJson;

  /** 10 Definitions 섹션(B010)에서 사용 */
  definitions?: Pillar2DefinitionJson[];
}

/** exec_summary_blocks.json의 한 블록 */
export interface Pillar2ExecSummaryBlockJson {
  block_id: string;
  book_id: string;
  section_title: string;
  page_range: Pillar2PageRangeJson;
  source_section_keys: string[];
  stepj_doc: Pillar2StepJDocJson;
}

/** exec_summary_blocks.json 루트: 블록 배열 */
export type Pillar2ExecSummaryBlocksJson = Pillar2ExecSummaryBlockJson[];

/* ======================================================
 * VM 타입 (뷰 편의용 + 원본 보존)
 * ====================================================== */

export interface Pillar2ExecSummarySourceBlockVM {
  /** 원본 JSON 한 블록 전체 (정보 손실 없이 보존) */
  raw: Pillar2ExecSummaryBlockJson;

  /** 공통 메타 */
  blockId: string;
  bookId: string;
  sectionTitle: string;
  sectionNumber?: number;

  pageRange: {
    pageStart: number;
    pageEnd: number;
  };

  /** 블록 레벨 source_section_keys */
  sourceSectionKeys: string[];

  /** stepj_doc.source_section_keys */
  stepJSourceSectionKeys: string[];

  /** 원본 pillar2_cognitive_state (있으면 그대로, 없으면 undefined) */
  pillar2_cognitive_state?: Pillar2CognitiveStateJson;

  /** Definitions 섹션용 용어 정의 전체 */
  definitions: Pillar2DefinitionJson[];

  /**
   * pillar2_cognitive_state 편의용 평탄화
   * - JSON 키셋과 1:1로 대응
   * - cognitive_state가 없으면 기본값(빈 문자열/배열)
   */
  pillar2: {
    structuralRole: string;
    coreMessage: string;
    keyConcepts: Pillar2KeyConceptJson[];
    mainRules: Pillar2MainRuleJson[];
    quantitativeParameters: Pillar2QuantitativeParameterJson[];
    interactionsAndDependencies: Pillar2InteractionOrDependencyJson[];
    implementationChallenges: Pillar2ImplementationChallengeJson[];
    electionsAndSafeHarbours: Pillar2ElectionOrSafeHarbourJson[];
    openPolicyQuestions: string[];
  };
}

export interface Pillar2ExecSummarySourceBlocksVM {
  bookId: string;
  blocks: Pillar2ExecSummarySourceBlockVM[];
}

/* ======================================================
 * 어댑터 구현
 * ====================================================== */

/**
 * exec_summary_blocks.json → Pillar2ExecSummarySourceBlocksVM
 * - JSON 스키마 전체를 타입으로 반영
 * - raw에 원본 그대로 보존
 * - pillar2_cognitive_state와 definitions를 전부 매핑
 */
export function adaptPillar2ExecSummaryBlocks(
  api: unknown
): Pillar2ExecSummarySourceBlocksVM {
  if (!Array.isArray(api)) {
    throw new Error("Invalid payload: expected exec_summary_blocks array");
  }

  const blocksJson = api as Pillar2ExecSummaryBlocksJson;

  if (blocksJson.length === 0) {
    throw new Error("Invalid payload: empty exec_summary_blocks array");
  }

  const first = blocksJson[0];
  const bookId = first.book_id;
  if (typeof bookId !== "string" || !bookId) {
    throw new Error("Invalid payload: book_id missing on first block");
  }

  const blocks: Pillar2ExecSummarySourceBlockVM[] = blocksJson.map(
    (b: Pillar2ExecSummaryBlockJson): Pillar2ExecSummarySourceBlockVM => {
      if (!b.block_id) {
        throw new Error("Invalid block: block_id missing");
      }

      const stepj = b.stepj_doc;

      const c = stepj.pillar2_cognitive_state;

      // pillar2_cognitive_state가 없는 블록(Definitions 등)은 빈 값으로 채움
      const structuralRole =
        c && typeof c.structural_role === "string" ? c.structural_role : "";
      const coreMessage =
        c && typeof c.core_message === "string" ? c.core_message : "";

      const keyConcepts = c && Array.isArray(c.key_concepts)
        ? c.key_concepts
        : [];

      const mainRules = c && Array.isArray(c.main_rules)
        ? c.main_rules
        : [];

      const quantitativeParameters =
        c && Array.isArray(c.quantitative_parameters)
          ? c.quantitative_parameters
          : [];

      const interactionsAndDependencies =
        c && Array.isArray(c.interactions_and_dependencies)
          ? c.interactions_and_dependencies
          : [];

      const implementationChallenges =
        c && Array.isArray(c.implementation_challenges)
          ? c.implementation_challenges
          : [];

      const electionsAndSafeHarbours =
        c && Array.isArray(c.elections_and_safe_harbours)
          ? c.elections_and_safe_harbours
          : [];

      const openPolicyQuestions =
        c && Array.isArray(c.open_policy_questions)
          ? c.open_policy_questions
          : [];

      const definitions = Array.isArray(stepj.definitions)
        ? stepj.definitions
        : [];

      return {
        raw: b,

        blockId: b.block_id,
        bookId: b.book_id,
        sectionTitle: b.section_title,
        sectionNumber: stepj.section_number,

        pageRange: {
          pageStart: b.page_range.page_start,
          pageEnd: b.page_range.page_end,
        },

        sourceSectionKeys: b.source_section_keys,
        stepJSourceSectionKeys: stepj.source_section_keys,

        pillar2_cognitive_state: c,
        definitions,

        pillar2: {
          structuralRole,
          coreMessage,
          keyConcepts,
          mainRules,
          quantitativeParameters,
          interactionsAndDependencies,
          implementationChallenges,
          electionsAndSafeHarbours,
          openPolicyQuestions,
        },
      };
    }
  );

  return {
    bookId,
    blocks,
  };
}

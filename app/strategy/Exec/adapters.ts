// app/strategy/Exec/adapters.ts

/* ======================================================
 * Domain Types
 * ====================================================== */

export type AudienceKey =
  | "policy_makers"
  | "supervisors_and_enforcement"
  | "private_sector_practitioners";

export const AUDIENCE_LABEL: Record<AudienceKey, string> = {
  policy_makers: "정책·입법·제도 설계자",
  supervisors_and_enforcement: "감독·집행·조사자",
  private_sector_practitioners: "민간 의무 주체자",
};

export type DigestAudienceVM = {
  key: AudienceKey;
  label: string;
  guidance: string;
};

/**
 * reading_map 단위 VM
 * - 존재하지 않으면 아예 undefined
 */
export type ReadingMapVM = {
  startHere: string[];
  thenReview: string[];
  why: string;
};

/**
 * Decision Trigger VM
 */
export type DecisionTriggerVM = {
  condition: string;
  faultLine: string;
  whyItMatters: string;
  whereToVerify: string[];
};

/**
 * Digest Group VM
 * - Exec Digest 화면에서 사용하는 최소·충분 단위
 */
export type DigestGroupVM = {
  groupId: string;

  onePageTakeaway: string;
  structuralPatterns: string[];
  decisionTriggers: DecisionTriggerVM[];

  /**
   * audience_specific_guidance
   * - 항상 3 audience 고정
   */
  audienceGuidance: DigestAudienceVM[];

  /**
   * reading_map
   * - audience별로 선택적
   * - fallback / 추정 없음
   */
  readingMapByAudience: Partial<Record<AudienceKey, ReadingMapVM>>;
};

/**
 * Exec Digest 전체 VM
 */
export type ExecDigestVM = {
  bookId: string;
  groups: DigestGroupVM[];
};

/* ======================================================
 * Internal Mapping (명시적, 추측 없음)
 * ====================================================== */

/**
 * audience_specific_guidance → reading_map key 매핑
 * ⚠️ 데이터 설계 그대로 반영
 */
const READING_MAP_KEYS_BY_AUDIENCE: Record<AudienceKey, string[]> = {
  policy_makers: ["policy_maker", "policy_makers"],
  supervisors_and_enforcement: [
    "supervisor_enforcer",
    "supervisors_and_enforcement",
  ],
  private_sector_practitioners: [
    "private_sector_practitioners"],
};

/* ======================================================
 * Adapter
 * ====================================================== */

/**
 * exec_digest.json → ExecDigestVM
 *
 * 설계 원칙:
 * - JSON 구조 추측 ❌
 * - fallback ❌
 * - 렌더링 관점 판단 ❌
 * - "없으면 없음" 그대로 유지
 */
export function adaptExecDigest(api: any): ExecDigestVM {
  if (!api || typeof api !== "object") {
    throw new Error("Invalid exec_digest payload");
  }

  const ed = api.executive_digest;
  if (!ed) {
    throw new Error("Invalid exec_digest payload: executive_digest missing");
  }

  /* ---------- reading_map → VM ---------- */
  const readingMapByAudience: Partial<Record<AudienceKey, ReadingMapVM>> = {};
  const audienceGuidance: DigestAudienceVM[] = (
    Object.keys(AUDIENCE_LABEL) as AudienceKey[]
  ).map((key) => ({
    key,
    label: AUDIENCE_LABEL[key],
    guidance: ed.audience_specific_guidance?.[key] ?? "",
  }));

  (Object.keys(READING_MAP_KEYS_BY_AUDIENCE) as AudienceKey[]).forEach(
    (audience) => {
      const keys = READING_MAP_KEYS_BY_AUDIENCE[audience];

      const rm = keys.map((k) => ed.reading_map?.[k]).find(Boolean);

      if (rm) {
        readingMapByAudience[audience] = {
          startHere: Array.isArray(rm.start_here) ? rm.start_here : [],
          thenReview: Array.isArray(rm.then_review) ? rm.then_review : [],
          why: typeof rm.why === "string" ? rm.why : "",
        };
      }
    }
  );

  /* ---------- decision triggers ---------- */
  const decisionTriggers: DecisionTriggerVM[] = Array.isArray(ed.decision_triggers)
    ? ed.decision_triggers.map((t: any) => ({
        condition: t.condition ?? "",
        faultLine: t.fault_line ?? "",
        whyItMatters: t.why_it_matters ?? "",
        whereToVerify: Array.isArray(t.where_to_verify) ? t.where_to_verify : [],
      }))
    : [];

  return {
    bookId: api.book_id,
    groups: [
      {
        groupId: "DEFAULT",
        onePageTakeaway: ed.one_page_takeaway ?? "",
        structuralPatterns: Array.isArray(ed.structural_pattern_overview)
          ? ed.structural_pattern_overview
          : [],
        decisionTriggers,
        audienceGuidance,
        readingMapByAudience,
      },
    ],
  };
}

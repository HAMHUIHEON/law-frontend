// E_STEP2/adapters.ts

import {
  Step2SectionRaw,
  Step2SectionViewModel,
  EngineItem,
  L2ViewBlock,
} from "./types";

/* ===============================
   L2 한글 레이블 매핑
================================= */

const L2_LABEL_MAP: Record<string, string> = {
  Authority: "권한 구조",
  Trigger: "개시 요건",
  Gate: "통제 관문",
  Notice: "통지 구조",
  Record_Form: "기록 체계",
  Limits: "한계 규범",
  Coercive_Measures: "강제 수단",
};

/* ===============================
   Main Adapter
================================= */

export function adaptStep2Section(
  raw: Step2SectionRaw
): Step2SectionViewModel {
  return {
    chapter: raw.chapter,
    section: raw.section,

    /* ---------- L0 ---------- */
    L0: {
      normative_anchors: raw.L0?.normative_anchors ?? [],
    },

    /* ---------- L1 ---------- */
    L1: {
      scope_statement: raw.L1?.scope_statement ?? "",
      components: raw.L1?.components ?? [],
      article_map: raw.L1?.article_map ?? [],
    },

    /* ---------- L2 ---------- */
    L2: buildL2Blocks(raw.L2),

    /* ---------- L3 ---------- */
    L3: {
      dispute_points: {
        items: normalizeArray(raw.L3?.dispute_points),
        reason: raw.L3?.dispute_points?.reason ?? null,
      },
      defense_checklist: {
        items: normalizeArray(raw.L3?.defense_checklist),
        reason: raw.L3?.defense_checklist?.reason ?? null,
      },
      ops_artifacts: {
        items: normalizeArray(raw.L3?.ops_artifacts),
        reason: raw.L3?.ops_artifacts?.reason ?? null,
      },
      conversion_rules: {
        items: normalizeArray(raw.L3?.conversion_rules),
        reason: raw.L3?.conversion_rules?.reason ?? null,
      },
      system_tension: normalizeSystemTension(raw.L3?.system_tension),
    },
  };
}

/* ===============================
   L2 Builder (핵심)
================================= */

function buildL2Blocks(rawL2: any): L2ViewBlock[] {
  if (!rawL2) return [];

  return Object.keys(rawL2)
    .filter((key) => L2_LABEL_MAP[key])
    .map((key) => {
      const normalized = normalizeBlock(rawL2[key]);

      return {
        key,
        label: L2_LABEL_MAP[key],
        items: normalized.items,
        reason: normalized.reason,
      };
    });
}

/* ===============================
   구조 정규화 유틸
================================= */

function normalizeBlock(block: any): {
  items: EngineItem[];
  reason: string | null;
} {
  if (!block) {
    return { items: [], reason: null };
  }

  // ✅ chapter2/3처럼 배열로 오는 경우
  if (Array.isArray(block)) {
    return {
      items: block,
      reason: null,
    };
  }

  // ✅ chapter1처럼 { items: [...] } 구조
  if (Array.isArray(block.items)) {
    return {
      items: block.items,
      reason: block.reason ?? null,
    };
  }

  return { items: [], reason: null };
}

function normalizeArray(block: any) {
  if (!block) return [];

  // 배열 구조인 경우 (chapter2/3)
  if (Array.isArray(block)) return block;

  // { items: [...] } 구조 (chapter1)
  if (Array.isArray(block.items)) return block.items;

  return [];
}

function normalizeSystemTension(data: any) {
  if (!data) return null;

  // chapter2/3에서 배열로 올 수도 있음
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }

  return data;
}

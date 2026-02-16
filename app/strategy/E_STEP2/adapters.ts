// E_STEP2/adapters.ts

import {
  Step2SectionRaw,
  Step2SectionViewModel,
} from "./types";

export function adaptStep2Section(
  raw: Step2SectionRaw
): Step2SectionViewModel {
  return {
    chapter: raw.chapter,
    section: raw.section,

    L0: {
      normative_anchors: raw.L0?.normative_anchors ?? [],
    },

    L1: {
      scope_statement: raw.L1?.scope_statement ?? "",
      components: raw.L1?.components ?? [],
      article_map: raw.L1?.article_map ?? [],
    },

    L2: {
      Authority: normalizeBlock(raw.L2?.Authority),
      Trigger: normalizeBlock(raw.L2?.Trigger),
      Gate: normalizeBlock(raw.L2?.Gate),
      Notice: normalizeBlock(raw.L2?.Notice),
      Record_Form: normalizeBlock(raw.L2?.Record_Form),
      Limits: normalizeBlock(raw.L2?.Limits),
    },

    L3: {
      dispute_points: {
        items: raw.L3?.dispute_points?.items ?? [],
        reason: raw.L3?.dispute_points?.reason ?? null,
      },
      defense_checklist: {
        items: raw.L3?.defense_checklist?.items ?? [],
        reason: raw.L3?.defense_checklist?.reason ?? null,
      },
      ops_artifacts: {
        items: raw.L3?.ops_artifacts?.items ?? [],
        reason: raw.L3?.ops_artifacts?.reason ?? null,
      },
      conversion_rules: {
        items: raw.L3?.conversion_rules?.items ?? [],
        reason: raw.L3?.conversion_rules?.reason ?? null,
      },
      system_tension: raw.L3?.system_tension,
    },
  };
}

function normalizeBlock(block: any) {
  return {
    items: block?.items ?? [],
    reason: block?.reason ?? null,
  };
}

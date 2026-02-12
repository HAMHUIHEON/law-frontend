//app/strategy/E_STEP1/chapter2/adapters.ts
import {
  Chapter2Step1Raw,
  Chapter2Step1ViewModel,
} from "./types";

export function adaptChapter2Step1(
  raw: Chapter2Step1Raw
): Chapter2Step1ViewModel {
  return {
    raw,

    summaryText: raw.chapter_summary.text,

    investigationUnits: raw.investigation_structure ?? [],
    principles: raw.key_operating_principles ?? [],
    controlPoints: raw.authority_and_control_map ?? [],
    branchPoints: raw.major_branch_points ?? [],
    tables: raw.tables ?? [],

    bridge: {
      limit: raw.bridge_to_step2?.step1_limit ?? "",
      focus: raw.bridge_to_step2?.step2_focus ?? "",
    },
  };
}

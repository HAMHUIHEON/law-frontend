///app/strategy/E_STEP1/chapter3/adapter.ts

import {
  Chapter3Step1Raw,
  Chapter3Step1ViewModel,
} from "./types";

export function adaptChapter3Step1(
  raw: Chapter3Step1Raw
): Chapter3Step1ViewModel {
  return {
    raw,

    summaryText: raw.chapter_summary.text,

    scope: raw.chapter_summary.chapter_scope,

    transition: raw.transition_from_chapter2,

    investigationUnits: raw.investigation_structure,

    controlPoints: raw.authority_and_control_map,

    coerciveMeasures: raw.coercive_measures_structure,

    decisionPipeline: raw.decision_to_punish_pipeline,

    tables: raw.tables,

    bridge: {
      limit: raw.bridge_to_step2.step1_limit,
      focus: raw.bridge_to_step2.step2_focus,
    },
  };
}

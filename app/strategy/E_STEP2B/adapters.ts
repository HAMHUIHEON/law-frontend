// 29_FINAL/law-frontend/app/strategy/E_STEP2B/adapters.ts
import { Step2bChapterAnalysis } from "./types";

export function adaptStep2bChapterAnalysis(
  raw: any
): Step2bChapterAnalysis {
  return {
    chapter: raw.chapter,
    normative_dependency_map: raw.normative_dependency_map ?? [],
    substantive_threshold_analysis:
      raw.substantive_threshold_analysis ?? [],
    risk_escalation_map: raw.risk_escalation_map ?? [],
  };
}

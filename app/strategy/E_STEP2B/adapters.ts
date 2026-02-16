// 29_FINAL/law-frontend/app/strategy/E_STEP2B/adapters.ts
import {
  Step2bChapterAnalysis,
  Step2bChapter1,
  Step2bChapter2,
  Step2bChapter3,
} from "./types";

export function adaptStep2bChapter(
  raw: any,
  chapter: "chapter1" | "chapter2" | "chapter3"
): Step2bChapterAnalysis {

  if (!raw) {
    throw new Error("Invalid Step2B data");
  }

  switch (chapter) {
    case "chapter1":
      return raw as Step2bChapter1;

    case "chapter2":
      return raw as Step2bChapter2;

    case "chapter3":
      return {
        chapter: raw.chapter,
        normative_dependency_map: raw.normative_dependency_map ?? [],
        substantive_threshold_analysis: raw.substantive_threshold_analysis ?? [],
        conversion_substance_link: raw.conversion_substance_link ?? [],
        risk_escalation_map: raw.risk_escalation_map ?? [],
      };

    default:
      throw new Error("Unknown chapter type");
  }
}

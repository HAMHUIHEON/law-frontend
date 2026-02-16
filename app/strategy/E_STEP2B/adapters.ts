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
      return raw as Step2bChapter3;

    default:
      throw new Error("Unknown chapter type");
  }
}

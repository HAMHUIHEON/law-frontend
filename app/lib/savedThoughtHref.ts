//app/lib/savedThogutHref.ts
// NOTE:
// 정확한 위치 복원이 가능해질 때 다시 사용 예정

import { ThoughtTargetType } from "@/types/me";

export type SavedThoughtRow = {
  target_type: ThoughtTargetType;
  target_id: string;
  parent_type: "case" | "law" | "strategy";
  parent_id: string;
};

function splitCaseTargetId(targetId: string) {
  if (targetId.includes("::")) {
    const [caseNo, issue] = targetId.split("::");
    return { caseNo, issue };
  }
  return { caseNo: targetId, issue: "" };
}

export function buildSavedThoughtHref(row: SavedThoughtRow): string {
  const { caseNo, issue } = splitCaseTargetId(row.target_id); // 판례 관련 쟁점 분리
  const qs = new URLSearchParams();


  // CASE
  if (row.parent_type === "case") {
    qs.set("caseId", row.parent_id);
    if (issue) qs.set("issue", issue); // 쟁점 추가

    switch (row.target_type) {
      case "case_flow":
        return `/cases/flow?${qs.toString()}`;
      case "case_structure":
        return `/cases/structure?${qs.toString()}`;
      case "case_practice":
        if (issue) qs.set("issue", issue); // 세부 쟁점 추가
        return `/cases/practice?${qs.toString()}`;
      default:
        return `/cases/flow?${qs.toString()}`;
    }
  }

  // LAW
  if (row.parent_type === "law") {
    qs.set("set", row.parent_id);
    qs.set("target", row.target_id); // 법령 조문으로 이동
    return `/law?${qs.toString()}`;
  }

  // STRATEGY
  if (row.parent_type === "strategy") {
    qs.set("book", row.parent_id);
    qs.set("view", row.target_id);
    return `/strategy?${qs.toString()}`;
  }

  return "/";
}
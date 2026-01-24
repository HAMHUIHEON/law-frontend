//  law-frontend/app/law/graph-Ui.tsx
"use client";

import type React from "react";
import dagre from "dagre";

export type AnyNode = {
  id: string | number;
  type: string;
  label?: string;
  meta?: Record<string, any>;
};

export const GRAPH_CANVAS_STYLE: React.CSSProperties = {
  height: "80vh",            // ✅ 두 화면 캔버스 높이 통일 (원하면 여기만 바꿈)
  width: "100%",
  borderBottom: "1px solid #e5e7eb",
  borderRadius: 10,
  background: "#fff",
  overflow: "hidden",
};


/** ✅ dagre 공통 설정 (두 화면 모두 이걸 씀) */
export const DAGRE_RANKDIR: "TB" | "LR" = "TB";
export const DAGRE_RANKSEP = 70;
export const DAGRE_NODESEP = 35;

/** ✅ dagre 노드 폭: 단일 진실 */
export const DAGRE_NODE_WIDTH = 240;

/** [기능] null/undefined 처리 */
export function pick<T>(v: T | undefined | null, fallback: T): T {
  return v == null ? fallback : v;
}

/** [기능] 텍스트 과밀 방지 */
export function shortText(s: string, max = 80) {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

/** ✅ dagre 노드 높이 규칙: 단일 진실 */
export function getNodeHeight(type: string, label: string) {
  const base =
    type === "IntegratedChapter" ? 140 :
    type === "ReasoningIssue" ? 200 :
    type === "Article" ? 150 :
    type === "Chapter" ? 110 :
    type === "Section" ? 95 :
    type === "Subdivision" ? 95 :
    type === "Law" || type === "Decree" || type === "Rule" ? 110 :
    90;

  const extra = Math.min(80, Math.floor(String(label ?? "").length / 45) * 20);
  return base + extra;
}

/**
 * ✅ 공통 dagre 레이아웃 함수 (MAIN/STRUCTURE 둘 다 사용)
 * - nodes의 data.label, data.type을 기준으로 width/height를 계산
 * - position을 dagre 결과로 덮어씀
 */
export function layoutWithDagre(nodes: any[], edges: any[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: DAGRE_RANKDIR,
    ranksep: DAGRE_RANKSEP,
    nodesep: DAGRE_NODESEP,
  });

  nodes.forEach((n) => {
    const label = String(n?.data?.label ?? "");
    const type = String(n?.data?.type ?? "");
    const height = getNodeHeight(type, label);

    g.setNode(n.id, { width: DAGRE_NODE_WIDTH, height });
  });

  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return nodes.map((n) => {
    const p = g.node(n.id);
    const height = p?.height ?? 80;
    return {
      ...n,
      position: {
        x: (p?.x ?? 0) - DAGRE_NODE_WIDTH / 2,
        y: (p?.y ?? 0) - height / 2,
      },
    };
  });
}

/**
 * [기능] 그래프 노드의 "표시 라벨" 생성
 * - MAIN/STRUCTURE 공통 규칙
 */

const TYPE_KO_LABEL: Record<string, string> = {
  ReasoningIssue: "쟁점",
  ReasoningStep: "판단 단계",
  SemanticIssue: "의미 쟁점",
};

export function makeLabel(
  n: AnyNode,
  opts?: { chapterTitleById?: Record<string, string> }
) {
  const type = n.type ?? "Unknown";
  const label = pick(n.label, "");
  const meta = n.meta ?? {};
  const chapterTitleById = opts?.chapterTitleById ?? {};

  if (type === "Law" || type === "Decree" || type === "Rule") {
    const name = meta.name || meta.law_name || label;
    const scope = meta.source_type || type;
    return `[${scope}] ${shortText(String(name), 90)}`;
  }

  if (type === "IntegratedChapter") {
    const cid = String(meta.chapter_id || label || "");
    const title =
      meta.title ||
      meta.chapter_title ||
      meta.name ||                  // ✅ 백엔드가 name으로 주는 케이스
      chapterTitleById[cid] ||
      "";

    const body = title ? shortText(String(title), 110) : shortText(cid, 80);
    return `[국세조세조정에 관한 관계 법령]\n${body}`;

  }

if (type === "Chapter") {
  const scope = meta.scope;              // LAW / DECREE / RULE
  const lawName = meta.law_name;         // 국제조세조정에 관한 법률
  const chapterTitle = meta.title;       // 제1장 총칙

  const lines: string[] = [];

  if (scope) {
    lines.push(`[${scope}]`);
  }

  if (lawName) {
    lines.push(lawName);
  }

  if (chapterTitle) {
    lines.push(chapterTitle);
  }

  return lines.join("\n");
}


  if (type === "Section") return `[Section]\n${shortText(String(meta.title || label), 110)}`;
  if (type === "Subdivision") return `[Subdivision]\n${shortText(String(meta.title || label), 110)}`;


if (type === "Article") {
  const t = meta.title || meta.raw_text || label;
  const scope = meta.scope; // LAW / DECREE / RULE

  const header = scope ? `[${scope}]` : `[Article]`;

  return `${header}\n${shortText(String(t), 200)}`;
}

if (type === "ReasoningIssue") {
  return `[핵심 쟁점]\n${shortText(String(label), 140)}`;
}

if (type === "ReasoningStep") {
  return `[검토 단계]\n${shortText(String(label), 120)}`;
}

if (type === "SemanticIssue") {
  return `[해석 포인트]\n${shortText(String(label), 120)}`;
}

}

/** [기능] 노드 타입별 스타일 규칙 (MAIN/STRUCTURE 통일) */
export function nodeStyle(type: string): React.CSSProperties {
  if (type === "IntegratedChapter") {
    return {
      background: "#cbdcf9ff",
      color: "#111827",
      border: "1px solid #a5b4fc",           // 👈 추가
      fontWeight: 500,
      textAlign: "center",
    };
  }

  if (type === "ReasoningIssue") {
    return {
      background: "#e0e4f4ff",
      color: "#111827",
      border: "1px solid #c7d2fe",             // 👈 통일
      fontWeight: 500,
      textAlign: "center",
    };
  }

  if (type === "ReasoningStep") {
    return {
      background: "#eff5f9ff",        // 회색 섞인 아주 연한 블루
      border: "1px solid #d6e4ea",  // 블루기 도는 border
      color: "#111827",
      fontWeight: 500,
      textAlign: "center",
    };
  }

  // 🔵 법령 챕터 (LAW / DECREE / RULE)
  if (type === "Chapter") {
    return {
      background: "#e0e7ff",       // indigo-100
      color: "#111827",
      border: "1px solid #c7d2fe",
    };
  }

  // 🔹 Section (구조 중간)
  if (type === "Section") {
    return {
      background: "#eef2ff",       // indigo-50
      color: "#111827",
      border: "1px solid #e5e7eb",
    };
  }

  // 🔹 Subdivision (구조 하위)
  if (type === "Subdivision") {
    return {
      background: "#f1f5f9",       // slate-100
      color: "#111827",
      border: "1px solid #e5e7eb",
    };
  }

  // ⚪ Article (말단 텍스트)
  if (type === "Article") {
    return {
      background: "#f4f4f4ff",
      color: "#111827",
      border: "1px solid #e5e7ebff",
    };
  }

  // 기본
  return {
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #e5e7eb",
  };
}

/** [기능] ReactFlow 노드 기본 텍스트 스타일 (통일) */
export const RF_NODE_TEXT_STYLE: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 400,
  lineHeight: 1.4,
  whiteSpace: "pre-wrap",
  padding: 14,
  borderRadius: 10,
};


/** =========================
 * Edge UI (SSOT)
 * ========================= */

export const RF_EDGE_STYLE = {
  stroke: "#9ca3af",
  strokeWidth: 1.2,
};

export const RF_EDGE_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 400,   // ✅ 굵기 여기서 통제
  fill: "#6b7280",
  background: "#ffffff",
};


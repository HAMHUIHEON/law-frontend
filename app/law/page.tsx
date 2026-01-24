// law-frontend/app/law/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

import { useLawUI } from "./LawUIContext";

// ===== Feature Views =====
// app/law/page.tsx
import StructureGraph from "./features/structure/StructureGraph";
import SemanticView from "./features/semantic/SemanticView";
import ReasoningStepView from "./features/reasoning/ReasoningStepView";
import ArticleReadView from "./features/article/ArticleView";

// ===== ReactFlow Custom Nodes =====
import SemanticIssueNode from "./features/semantic/SemanticIssueNode";
import ReasoningIssueNode from "./features/reasoning/ReasoningIssueNode";

// ===== Graph Utilities =====
import {
  GRAPH_CANVAS_STYLE,
  makeLabel,
  nodeStyle,
  RF_NODE_TEXT_STYLE,
  layoutWithDagre,
  DAGRE_NODE_WIDTH,
  RF_EDGE_STYLE,
  RF_EDGE_LABEL_STYLE,
} from "./graph/graph-Ui";

/* ======================================================
 * ReactFlow Node Registry
 * ====================================================== */
const nodeTypes = {
  SemanticIssue: SemanticIssueNode,
  ReasoningIssue: ReasoningIssueNode,
};

/* ======================================================
 * Utils
 * ====================================================== */
function normalizeReasoningTitle(raw: string): string {
  return raw
    .replace(/\[[^\]]+]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Raw graph(JSON) → ReactFlow(nodes, edges)
 * - layout은 graph-Ui(layoutWithDagre)가 SSOT
 */
function toReactFlow(
  graph: any,
  opts: { showFlow: boolean; showArticle: boolean },
  chapterTitleById: Record<string, string>
) {
  const { showFlow, showArticle } = opts;

  const nodes = (graph.nodes ?? [])
    .filter((n: any) => {
      if (!showFlow) return false;
      if (!showArticle && n.type === "Article") return false;
      return true;
    })
    .map((n: any) => {
      const label = makeLabel(n, { chapterTitleById });

      return {
        id: String(n.id),
        type:
          n.type === "SemanticIssue"
            ? "SemanticIssue"
            : n.type === "ReasoningIssue"
            ? "ReasoningIssue"
            : undefined,
        data: {
          label,
          type: n.type,
          meta: n.meta ?? {},
        },
        position: { x: 0, y: 0 },
        style:
          n.type === "SemanticIssue" || n.type === "ReasoningIssue"
            ? { width: DAGRE_NODE_WIDTH }
            : {
                ...nodeStyle(n.type),
                ...RF_NODE_TEXT_STYLE,
                width: DAGRE_NODE_WIDTH,
              },
      };
    });

  const nodeIdSet = new Set(nodes.map((n: any) => n.id));

  const edges = (graph.edges ?? [])
    .filter((e: any) => {
      if (!showFlow) return false;
      if (!showArticle && e.type === "BASED_ON") return false;
      return true;
    })
    .map((e: any, idx: number) => ({
      id: `${e.from}-${e.to}-${e.type}-${idx}`,
      source: String(e.from),
      target: String(e.to),
      label: e.type,
      style: RF_EDGE_STYLE,
      labelStyle: RF_EDGE_LABEL_STYLE,
    }))
    .filter((e: any) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target));

  return {
    nodes: layoutWithDagre(nodes, edges),
    edges,
  };
}

/* ======================================================
 * Page
 * ====================================================== */
export default function LawPage() {
  const {
    snapshot,
    chapters,
    currentChapter,
    viewOptions,
    graphMode,
    setGraphMode,
    setSelectedIssueId,
  } = useLawUI();
  /* ------------------------------
   * FLOW graph state
   * ------------------------------ */
  const [graph, setGraph] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // FLOW 그래프 로딩
  useEffect(() => {
    if (!snapshot || !currentChapter) return;

    if (graphMode !== "FLOW") {
      setGraph(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(
      `http://127.0.0.1:8000/api/law/chapters/${currentChapter}/graph?set_key=${snapshot.set_key}`
    )
      .then((res) => res.json())
      .then((data) => {
        setGraph(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [snapshot, currentChapter, graphMode]);

  /* ------------------------------
   * Chapter title map (fallback)
   * ------------------------------ */
  const chapterTitleById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const ch of chapters ?? []) {
      if (ch?.chapter_id && ch.title) {
        m[ch.chapter_id] = ch.title;
      }
    }
    return m;
  }, [chapters]);

  /* ------------------------------
   * ReactFlow derived state
   * ------------------------------ */
  const rf = useMemo(() => {
    if (!graph) return null;

    return toReactFlow(
      graph,
      {
        showFlow: viewOptions.showFlow,
        showArticle: viewOptions.showArticle,
      },
      chapterTitleById
    );
  }, [graph, viewOptions, chapterTitleById]);

  const fitTargets = useMemo(() => {
    if (!rf) return undefined;
    const targets = rf.nodes.filter(
      (n) => n.data?.type === "IntegratedChapter"
    );
    return targets.length > 0 ? targets : undefined;
  }, [rf]);

  /* ======================================================
   * Render (Mode Switch)
   * ====================================================== */
  return (
    
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {graphMode === "ARTICLE" && <ArticleReadView />}

      {graphMode === "STRUCTURE" && (
        <StructureGraph snapshot={snapshot} currentChapter={currentChapter} />
      )}

      {graphMode === "SEMANTIC" && (
        <SemanticView snapshot={snapshot} currentChapter={currentChapter} />
      )}

      {graphMode === "REASONING" && (
        <ReasoningStepView snapshot={snapshot} currentChapter={currentChapter} />
      )}

      {graphMode === "FLOW" && (
        <>
          {loading && <p style={{ color: "#6b7280" }}>로딩 중…</p>}

          {!loading && !viewOptions.showFlow && (
            <div style={{ padding: 16 }}>
              “사고 흐름”은 최소 화면 조건입니다.
            </div>
          )}

          {!loading && viewOptions.showFlow && rf && (
            <div style={{ padding: 16 }}>
              <div style={GRAPH_CANVAS_STYLE}>
                <ReactFlow
                  nodes={rf.nodes}
                  edges={rf.edges}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{
                    padding: 0.8,
                    duration: 2200,
                    minZoom: 1.0,
                    nodes: fitTargets,
                  }}
                  onNodeClick={(_, node) => {
                    const type = node.data?.type;
                    const label = node.data?.label;
                    const meta = node.data?.meta;

                    if (type === "SemanticIssue" && meta?.issue_id) {
                      setSelectedIssueId(meta.issue_id);
                      setGraphMode("SEMANTIC");
                    }

                    if (type === "ReasoningIssue" && label) {
                      setSelectedIssueId(
                        normalizeReasoningTitle(String(label))
                      );
                      setGraphMode("REASONING");
                    }
                  }}
                >
                  <Background />
                  <Controls />
                </ReactFlow>
              </div>
              
            </div>
            
          )}
        </>
        
      )}
    </div>
  );
}

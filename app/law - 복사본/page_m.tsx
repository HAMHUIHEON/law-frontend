//  law-frontend/app/law/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

import { useLawUI, Snapshot, Chapter, GraphMode, } from "./LawUIContext";
import StructureGraph from "./StructureGraph";
import SemanticView from "./SemanticView";
import SemanticIssueNode from "./SemanticIssueNode";
import ReasoningStepView from "./ReasoningStepView";
import ReasoningIssueNode from "./ReasoningIssueNode";
import ArticleReadView from "./ArticleView";


import {
  GRAPH_CANVAS_STYLE,
  makeLabel,
  nodeStyle,
  RF_NODE_TEXT_STYLE,
  layoutWithDagre,
  DAGRE_NODE_WIDTH,
  RF_EDGE_STYLE,
  RF_EDGE_LABEL_STYLE,
} from "./graph-Ui";


const nodeTypes = {
  SemanticIssue: SemanticIssueNode,
  ReasoningIssue: ReasoningIssueNode, // ✅ 추가
};


function normalizeReasoningTitle(raw: string): string {
  return raw
    .replace(/\[[^\]]+]/g, "")   // [핵심 쟁점] 같은 태그 제거
    .replace(/\s+/g, " ")        // 줄바꿈/다중 공백 → 공백 하나
    .trim();
}


/**
 * ✅ Raw graph(JSON) → ReactFlow(nodes, edges)
 * - layout은 graph-Ui(layoutWithDagre)가 전담 (SSOT)
 */

function toReactFlow(
  graph: any,
  opts: { showFlow: boolean; showArticle: boolean },
  chapterTitleById: Record<string, string>
) {
  const { showFlow, showArticle } = opts;

  const rfNodes = (graph.nodes ?? [])
    .filter((n: any) => {
      if (!showFlow) return false;
      if (!showArticle && n.type === "Article") return false;
      return true;
    })
    .map((n: any) => {
      const label = makeLabel(n, { chapterTitleById });
      const isSemantic = n.type === "SemanticIssue";

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
            ? { width: DAGRE_NODE_WIDTH } // 커스텀 노드는 스타일 최소화
            : {
                ...nodeStyle(n.type),
                ...RF_NODE_TEXT_STYLE,
                width: DAGRE_NODE_WIDTH,
              },
      };

    });


  const nodeIdSet = new Set(rfNodes.map((n: any) => n.id));

  const baseEdges = (graph.edges ?? [])
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

  return { nodes: layoutWithDagre(rfNodes, baseEdges), edges: baseEdges };
}

export default function LawPage() {
const {
  snapshot,
  chapters,
  setChapters,
  currentChapter,
  setCurrentChapter,
  viewOptions,
  graphMode,
  setGraphMode,
  setSelectedIssueId,
  articleQuery,
  selectedArticleRef,
  setSelectedArticleRef,
} = useLawUI();


  const [graph, setGraph] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // MAIN 그래프 로딩
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
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [snapshot, currentChapter, graphMode]);

  // 역방향 usage 로딩

  // chapterTitleById (보강용 fallback)
  const chapterTitleById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const ch of chapters ?? []) {
      if (!ch?.chapter_id) continue;
      if (ch.title) m[ch.chapter_id] = ch.title;
    }
    return m;
  }, [chapters]);

  const renderGraph = graph;

  const rf = useMemo(() => {
    if (!renderGraph) return null;

  return toReactFlow(
    renderGraph,
    {
      showFlow: viewOptions.showFlow,
      showArticle: viewOptions.showArticle,
    },
    chapterTitleById
  );

  }, [
    renderGraph,
    viewOptions.showFlow,
    viewOptions.showArticle,
    chapterTitleById,
  ]);

  // ✅ IntegratedChapter를 “초기 중심”으로 잡기 위한 타겟 노드 목록
  const fitTargets = useMemo(() => {
    if (!rf) return undefined;

    const targets = rf.nodes.filter(
      (n) => n.data?.type === "IntegratedChapter"
    );

    return targets.length > 0 ? targets : undefined;
  }, [rf]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      
      {graphMode === "ARTICLE" && (
        <div style={{ height: "100%", background: "#fff" }}>
          <ArticleReadView />
        </div>
      )}
      {/* STRUCTURE */}
      {graphMode === "STRUCTURE" && (
        <div style={{ height: "100%", background: "#fff", padding: 18, color: "#111827" }}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>
            <StructureGraph snapshot={snapshot} currentChapter={currentChapter} />
          </div>
        </div>
      )}

      {/* SEMANTIC */}
      {graphMode === "SEMANTIC" && (
        <div style={{ height: "100%", background: "#fff", padding: 18, color: "#111827" }}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>
            <SemanticView snapshot={snapshot} currentChapter={currentChapter} />
          </div>
        </div>
      )}

      {/* REASONING */}
      {graphMode === "REASONING" && (
        <div style={{ height: "100%", background: "#fff", padding: 18, color: "#111827" }}>
          <ReasoningStepView snapshot={snapshot} currentChapter={currentChapter} />
        </div>
      )}

      {/* FLOW */}
      {graphMode === "FLOW" && (
        <>
          {loading && <p style={{ color: "#6b7280" }}>로딩 중…</p>}

          {!loading && !viewOptions.showFlow && (
            <div
              style={{
                padding: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                background: "#fff",
                color: "#111827",
              }}
            >
              “사고 흐름”은 최소 화면 조건입니다. 사이드바에서 필수 선택해주세요.
            </div>
          )}

          {!loading && viewOptions.showFlow && rf && (
            <div style={{ padding: 16 }}>
              <div style={GRAPH_CANVAS_STYLE}>
                <ReactFlow
                  key={`${snapshot?.set_key}-${currentChapter}-${viewOptions.showArticle}`}
                  nodes={rf.nodes}
                  edges={rf.edges}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{
                    padding: 0.8,
                    duration: 2200,
                    minZoom: 1.0,
                    nodes: fitTargets, // ✅ IntegratedChapter만 잡아서 fitView (없으면 전체 fit)
                  }}
                  onNodeClick={(_, node) => {
                      console.log("FLOW NODE CLICK", {
                      type: node.data?.type,
                      label: node.data?.label,
                      meta: node.data?.meta,
                    });
                    const type = node.data.type;
                    const label = node.data?.label;
                    const meta = node.data?.meta;

                    // ① SemanticIssue → 쟁점 뷰로 이동
                    if (type === "SemanticIssue" && meta?.issue_id) {
                      setSelectedIssueId(meta.issue_id);
                      setGraphMode("SEMANTIC");
                      return;
                    }

                    // ② ReasoningIssue → 법률 검토 방법
                    if (type === "ReasoningIssue" && label) {
                      const normalized = normalizeReasoningTitle(String(label));
                      setSelectedIssueId(normalized);
                      setGraphMode("REASONING");
                      return;
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



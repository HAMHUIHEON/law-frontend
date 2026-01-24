// law-frontend/app/law/features/structure/StructureGraph.tsx
"use client";

/**
 * StructureGraph
 *
 * - Chapter 단위 법령 구조(3단)를 ReactFlow로 시각화
 * - API raw graph → ReactFlow nodes/edges 변환
 * - dagre 기반 자동 레이아웃 적용
 */

import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type FitViewOptions,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  GRAPH_CANVAS_STYLE,
  makeLabel,
  nodeStyle,
  RF_NODE_TEXT_STYLE,
  layoutWithDagre,
  DAGRE_NODE_WIDTH,
  RF_EDGE_STYLE,
  RF_EDGE_LABEL_STYLE,
} from "../../graph/graph-Ui";

/* ======================================================
 * Types
 * ====================================================== */

type Props = {
  snapshot: { set_key: string } | null;
  currentChapter: string | null;
};

type RawNode = {
  id: number | string;
  type: string;
  label?: string;
  meta?: Record<string, any>;
};

type RawEdge = {
  id?: string;
  from: number | string;
  to: number | string;
  type?: string;
};

type RawGraph = {
  nodes: RawNode[];
  edges?: RawEdge[];
};

type RFNodeData = {
  label: string;
  type: string;
  meta: Record<string, any>;
};

/* ======================================================
 * Component
 * ====================================================== */

export default function StructureGraph({
  snapshot,
  currentChapter,
}: Props) {
  const [raw, setRaw] = useState<RawGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------
   * Fetch: Structure Graph
   * ------------------------------ */
  useEffect(() => {
    if (!snapshot || !currentChapter) return;

    setLoading(true);
    setError(null);

    fetch(
      `http://127.0.0.1:8000/api/law/chapters/${currentChapter}/structure?set_key=${snapshot.set_key}`
    )
      .then((res) => res.json())
      .then((data: RawGraph) => {
        setRaw(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setRaw(null);
        setError("구조 데이터를 불러오지 못했어요. (서버 로그 확인)");
        setLoading(false);
      });
  }, [snapshot, currentChapter]);

  /* ------------------------------
   * Raw → ReactFlow 변환
   * ------------------------------ */
  const rf = useMemo(() => {
    if (!raw) return null;

    const nodes: Node<RFNodeData>[] = (raw.nodes ?? []).map((n) => {
      const label = String(makeLabel(n) ?? "");

      return {
        id: String(n.id),
        data: {
          label,
          type: n.type,
          meta: n.meta ?? {},
        },
        position: { x: 0, y: 0 },
        style: {
          ...nodeStyle(n.type),
          ...RF_NODE_TEXT_STYLE,
          width: DAGRE_NODE_WIDTH,
        },
      };
    });

    const nodeIdSet = new Set(nodes.map((n) => n.id));

    const edges: Edge[] = (raw.edges ?? [])
      .map((e, idx) => {
        const source = String(e.from);
        const target = String(e.to);
        const type = e.type ?? "REL";

        return {
          id: `${source}->${target}:${type}:${idx}`,
          source,
          target,
          label: type,
          style: RF_EDGE_STYLE,
          labelStyle: RF_EDGE_LABEL_STYLE,
        };
      })
      .filter((e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target));

    return {
      nodes: layoutWithDagre(nodes, edges) as Node<RFNodeData>[],
      edges,
    };
  }, [raw]);

  /* ------------------------------
   * FitView 대상 노드 (IntegratedChapter)
   * ------------------------------ */
  const fitTargets = useMemo(() => {
    if (!rf) return undefined;

    const targets = rf.nodes.filter(
      (n) => (n.data as RFNodeData | undefined)?.type === "IntegratedChapter"
    );

    return targets.length > 0 ? targets : undefined;
  }, [rf]);

  const fitViewOptions = useMemo<FitViewOptions>(() => {
    const base: FitViewOptions = {
      padding: 0.8,
      duration: 2200,
      minZoom: 1.0,
    };

    return fitTargets
      ? { ...base, nodes: fitTargets as FitViewOptions["nodes"] }
      : base;
  }, [fitTargets]);

  /* ------------------------------
   * Render Guards
   * ------------------------------ */
  if (loading) {
    return <p style={{ color: "#6b7280" }}>구조 로딩 중…</p>;
  }

  if (error) {
    return <p style={{ color: "#ef4444" }}>{error}</p>;
  }

  if (!rf) return null;

  /* ------------------------------
   * Render
   * ------------------------------ */
  return (
    <div style={GRAPH_CANVAS_STYLE}>
      <ReactFlow
        key={`${snapshot?.set_key}-${currentChapter}`}
        nodes={rf.nodes}
        edges={rf.edges}
        fitView
        fitViewOptions={fitViewOptions}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

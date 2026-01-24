
// law-frontend/app/law/StructureGraph.tsx

"use client";

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
} from "./graph-Ui";

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
  type: string; // RawNode.type 그대로
  meta: Record<string, any>;
};

export default function StructureGraph({ snapshot, currentChapter }: Props) {
  const [raw, setRaw] = useState<RawGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!snapshot || !currentChapter) return;

    setLoading(true);
    setErrMsg(null);

    fetch(
      `http://127.0.0.1:8000/api/law/chapters/${currentChapter}/structure?set_key=${snapshot.set_key}`
    )
      .then((r) => r.json())
      .then((data: RawGraph) => {
        setRaw(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setRaw(null);
        setErrMsg("구조 데이터를 불러오지 못했음 (API/서버 로그 확인)");
        setLoading(false);
      });
  }, [snapshot, currentChapter]);

  const rf = useMemo(() => {
    if (!raw) return null;

    const nodes: Node<RFNodeData>[] = (raw.nodes ?? []).map((n) => {
      const label = String(makeLabel(n) ?? "");

      return {
        id: String(n.id),
        data: { label, type: n.type, meta: n.meta ?? {} },
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
        const typ = e.type ?? "REL";
        return {
          id: `${source}->${target}:${typ}:${idx}`,
          source,
          target,
          label: typ,
          style: RF_EDGE_STYLE,
          labelStyle: RF_EDGE_LABEL_STYLE,
        };
      })
      .filter((e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target));

    const laidOut = layoutWithDagre(nodes, edges) as Node<RFNodeData>[];

    return { nodes: laidOut, edges };
  }, [raw]);

  // ✅ IntegratedChapter가 있으면 그걸 기준으로 fitView 대상으로 삼기
  const fitTargets = useMemo(() => {
    if (!rf) return undefined;

    const targets = rf.nodes.filter(
      (n) => (n.data as RFNodeData | undefined)?.type === "IntegratedChapter"
    );

    return targets.length > 0 ? targets : undefined;
  }, [rf]);

  const fitViewOptions = useMemo((): FitViewOptions => {
    // ReactFlow 타입이 버전에 따라 nodes 타입이 까다로운 경우가 있어서
    // FitViewOptions로 안전하게 캐스팅해준다.
    const base: FitViewOptions = {
      padding: 0.8,
      duration: 2200,
      minZoom: 1.0,
    };

    if (fitTargets && fitTargets.length > 0) {
      return {
        ...base,
        nodes: fitTargets as unknown as FitViewOptions["nodes"],
      };
    }

    return base;
  }, [fitTargets]);

  if (loading) return <p style={{ color: "#6b7280" }}>구조 로딩 중…</p>;
  if (errMsg) return <p style={{ color: "#ef4444" }}>{errMsg}</p>;
  if (!rf) return null;

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

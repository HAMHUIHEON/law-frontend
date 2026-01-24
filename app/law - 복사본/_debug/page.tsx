"use client";

import { useEffect, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

type Snapshot = {
  set_key: string;
};

type Chapter = {
  chapter_id: string;
  title?: string;
};

export default function Home() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSetKey, setSelectedSetKey] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [graph, setGraph] = useState<any>(null);
  const [rfNodes, setRfNodes] = useState<any[]>([]);
  const [rfEdges, setRfEdges] = useState<any[]>([]);


  // 1️⃣ 스냅샷 목록
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/law/snapshots")
      .then((res) => res.json())
      .then((data) => setSnapshots(data))
      .catch(console.error);
  }, []);

  // 2️⃣ 챕터 목록
  useEffect(() => {
    if (!selectedSetKey) return;

    fetch(
      `http://127.0.0.1:8000/api/law/chapters?set_key=${selectedSetKey}`
    )
      .then((res) => res.json())
      .then((data) => setChapters(data))
      .catch(console.error);
  }, [selectedSetKey]);

  // 3️⃣ 챕터 그래프
  useEffect(() => {
    if (!selectedChapter || !selectedSetKey) return;

    fetch(
      `http://127.0.0.1:8000/api/law/chapters/${selectedChapter}/graph?set_key=${selectedSetKey}`
    )
      .then((res) => res.json())
      .then((data) => {
        setGraph(data);
        const rf = toReactFlow(data);
        setRfNodes(rf.nodes);
        setRfEdges(rf.edges);
      })
      .catch(console.error);
  }, [selectedChapter, selectedSetKey]);

  return (
    <main style={{ padding: 24 }}>
      <h1>📚 법률 스냅샷 목록</h1>

      <ul>
        {snapshots.map((s) => (
          <li key={s.set_key}>
            <button
              onClick={() => {
                setSelectedSetKey(s.set_key);
                setSelectedChapter(null);
                setGraph(null);
                setRfNodes([]);
                setRfEdges([]);

              }}
              style={{
                cursor: "pointer",
                color: selectedSetKey === s.set_key ? "blue" : "black",
              }}
            >
              {s.set_key}
            </button>
          </li>
        ))}
      </ul>

      {selectedSetKey && (
        <>
          <h2 style={{ marginTop: 32 }}>📖 챕터 목록</h2>
          <ul>
            {chapters.map((ch) => (
              <li
                key={ch.chapter_id}
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => setSelectedChapter(ch.chapter_id)}
              >
                {ch.chapter_id}
              </li>
            ))}
          </ul>
        </>
      )}
      {rfNodes.length > 0 && (
        <>
          <h3 style={{ marginTop: 40 }}>🧠 챕터 그래프 (React Flow)</h3>

          <div style={{ width: "100%", height: 600, border: "1px solid #ddd" }}>
            <ReactFlow nodes={rfNodes} edges={rfEdges} fitView>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </>
      )}
      {graph && (
        <>
          <h3 style={{ marginTop: 32 }}>🧠 챕터 그래프</h3>
          <pre style={{ fontSize: 12 }}>
            {JSON.stringify(graph, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}

function toReactFlow(graph: any) {
  const nodes = graph.nodes.map((n: any, idx: number) => ({
    id: String(n.id),
    data: { label: `[${n.type}] ${n.label}` },
    position: {
      x: (idx % 5) * 250,
      y: Math.floor(idx / 5) * 120,
    },
  }));

  const edges = graph.edges.map((e: any, idx: number) => ({
    id: `${e.from}-${e.to}-${idx}`,
    source: String(e.from),
    target: String(e.to),
    label: e.type,
    animated: true,
  }));

  return { nodes, edges };
}

const lawColors = {
  base: "#60a5fa",   // blue-400
  soft: "#bfdbfe",   // blue-200
  deep: "#1d4ed8",   // blue-700
};

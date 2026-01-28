// law-frontend/app/cases/practice/components/MessageCard.tsx
"use client";

import { useState } from "react";
import { styles } from "../styles";

function splitKoreanSentences(text: string): string[] {
  if (!text) return [];
  return text
    .split(/(?<=다\.)|(?<=함\.)|(?<=임\.)|(?<=였다\.)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function MessageCard({ title, text,locked }: { title: string; text: string;   locked?: boolean; }) {
  const [open, setOpen] = useState(false);

  const sentences = splitKoreanSentences(text);
  const lead = sentences[0] ?? "";
  const rest = sentences.slice(1);

  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
            {/* 🔒 내용만 블러 */}
      <div
        style={{
          filter: locked ? "blur(6px)" : "none",
          pointerEvents: locked ? "none" : "auto",
          userSelect: locked ? "none" : "auto",
        }}
      >
      <p style={styles.cardText}>{lead}</p>

      {rest.length > 0 && (
        <button style={styles.toggle} onClick={() => setOpen((v) => !v)}>
          {open ? "접기" : "자세히 보기"}
        </button>
      )}

      {open &&
        rest.map((s, i) => (
          <p key={i} style={styles.cardText}>
            {s}
          </p>
        ))}
        </div>
    </div>
  );
}

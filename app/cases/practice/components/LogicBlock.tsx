// law-frontend/app/cases/practice/components/LogicBlock.tsx
"use client";

import { styles } from "../styles";

function splitKoreanSentences(text: string): string[] {
  if (!text) return [];
  return text
    .split(/(?<=다\.)|(?<=함\.)|(?<=임\.)|(?<=였다\.)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function LogicBlock({ label, text }: { label: string; text: string }) {
  if (!text) return null;

  const paragraphs = splitKoreanSentences(text);

  return (
    <section style={styles.block}>
      <h4 style={styles.blockTitle}>{label}</h4>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{
            ...styles.blockText,
            marginBottom: "12px",
            lineHeight: "1.9",
            wordBreak: "keep-all",
          }}
        >
          {p}
        </p>
      ))}
    </section>
  );
}

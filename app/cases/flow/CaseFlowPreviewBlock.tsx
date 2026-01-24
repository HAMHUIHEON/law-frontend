// app/cases/flow/CaseFlowPreviewBlock.tsx
"use client";

type Props = {
  title: string;
  text: string;
};

export function CaseFlowPreviewBlock({ title, text }: Props) {
  const paragraphs = text
    .split(/(?<=다\.)|(?<=함\.)|(?<=임\.)|(?<=였다\.)/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section style={styles.previewSection}>
      <h3 style={styles.previewTitle}>{title}</h3>

      <div style={{ marginTop: 8 }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={styles.previewParagraph}>
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

const styles = {
  previewSection: {
    width: "100%",
    maxWidth: "720px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
    marginTop: "20px",
  },
  previewTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  },
  previewParagraph: {
    margin: "0 0 12px 0",
    fontSize: 13,
    lineHeight: 1.9,
    color: "#374151",
    wordBreak: "keep-all" as const,
  },
};

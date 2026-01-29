// app/me/SavedThoughtItem.tsx
"use client";

export function SavedThoughtItem({
  title,
}: {
  title: string;
}) {
  return (
    <div
      style={{
        fontSize: "14px",
        color: "rgba(255,255,255,0.45)",
        lineHeight: 1.6,
        display: "block",
        marginBottom: 6,
        cursor: "default",
      }}
    >
      {title}
    </div>
  );
}

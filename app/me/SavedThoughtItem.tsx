// app/me/SavedThoughtItem.tsx
"use client";

import Link from "next/link";

export function SavedThoughtItem({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  return (
    <Link
      href={href}// 동적으로 생성된 링크
      style={{
        fontSize: "14px",
        color: "rgba(255,255,255,0.55)",
        lineHeight: 1.6,
        display: "block",
        textDecoration: "none",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.88)";
        e.currentTarget.style.textDecoration = "underline";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.55)";
        e.currentTarget.style.textDecoration = "none";
      }}
    >
      {title}
    </Link>
  );
}

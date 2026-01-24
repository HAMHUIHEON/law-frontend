//law-frontend/app/strategy/components/PublicationComboBox.tsx

"use client";

import { useState, useMemo } from "react";

type Item = {
  book_id: string;
  title: string;
};

type Props = {
  items: Item[];
  value: string | null;
  onSelect: (item: Item) => void;
};

const colors = {
  base: "#a78bfa",
  soft: "#f5f3ff",
  softActive: "#ede9fe",
  deep: "#6d28d9",
  line: "#e5e7eb",
  muted: "#6b7280",
};

export function PublicationComboBox({ items, value, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedItem = useMemo(
    () => items.find((i) => i.book_id === value) ?? null,
    [items, value]
  );

  const filteredItems = useMemo(() => {
    if (!query) return items;
    return items.filter((i) =>
      i.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  const displayValue = open
    ? query
    : selectedItem?.title ?? "";

  return (
    <div style={{ position: "relative" }}>
      {/* 입력창 */}
      <input
        type="text"
        value={displayValue}
        placeholder="선택하세요"
        onFocus={() => setOpen(true)}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          fontSize: 13,
          borderRadius: 8,
          border: open
            ? `1px solid ${colors.base}`
            : `1px solid ${colors.line}`,
          background: selectedItem ? colors.soft : "#ffffff",
          color: selectedItem ? colors.deep : "#111827",
          outline: "none",
        }}
      />

      {/* 드롭다운 */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#ffffff",
            border: `1px solid ${colors.line}`,
            borderRadius: 8,
            maxHeight: 240,
            overflowY: "auto",
            zIndex: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {filteredItems.length === 0 && (
            <div
              style={{
                padding: 10,
                fontSize: 13,
                color: colors.muted,
              }}
            >
              결과가 없습니다
            </div>
          )}

          {filteredItems.map((item) => {
            const selected = item.book_id === value;

            return (
              <div
                key={item.book_id}
                onMouseDown={() => {
                  onSelect(item);
                  setOpen(false);
                  setQuery("");
                }}
                style={{
                  padding: "8px 10px",
                  fontSize: 13,
                  cursor: "pointer",
                  background: selected
                    ? colors.softActive
                    : "transparent",
                  color: selected
                    ? colors.deep
                    : "#111827",
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.background = "#f3f4f6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {item.title}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

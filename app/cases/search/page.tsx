// law-frontend/app/cases/search/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export default function IssueSearchPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function runSearch() {
    if (!query.trim()) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/search/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          top_k: 5,
        }),
      });

      if (!res.ok) {
        throw new Error(`Search failed (${res.status})`);
      }

      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>
        쟁점 기반 판례 검색
      </h1>

      {/* 검색 입력 */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 10,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
          placeholder="예: 현물출자 정상가격"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 6,
            fontSize: 14,
          }}
        />

        <button
          onClick={runSearch}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "1px solid #065f46",
            background: "#065f46",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          검색
        </button>
      </div>

      {/* 로딩 */}
      {loading && (
        <p style={{ marginTop: 20, color: "#6b7280" }}>
          검색 중...
        </p>
      )}

      {/* 결과 */}
      <div style={{ marginTop: 30 }}>
        {results.map((r, i) => (
          <div
            key={i}
            onClick={() =>
              router.push(`/cases?case_id=${encodeURIComponent(r.case_id)}`)
            }
            style={{
              padding: 16,
              border: "1px solid #eee",
              borderRadius: 8,
              marginBottom: 12,
              cursor: "pointer",
              background: "#fff",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fafafa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {r.case_id}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 14,
              }}
            >
              {r.core_issue}
            </div>

            {r.mini_conclusion && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: "#555",
                  lineHeight: 1.5,
                }}
              >
                {r.mini_conclusion.slice(0, 200)}...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
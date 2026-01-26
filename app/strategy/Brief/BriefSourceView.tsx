// law-frontend/app/strategy/Brief/BriefSourceView.tsx

"use client";

import { useStrategyUI } from "../StrategyUIContext"; // ✅ 이 줄 추가
import { PAGE_OFFSET_BY_BOOK } from "../pageoffset";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export function BriefSourceView({ bookId }: { bookId: string }) {
  const { briefPage, setBriefPage } = useStrategyUI();

  if (!briefPage) {
    return <div>페이지를 선택하세요</div>;
  }

  const offset = PAGE_OFFSET_BY_BOOK[bookId] ?? 0;
  const displayPage = briefPage + offset;

  return (
    <div style={{ maxWidth: 960 }}>
    <div
    style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#ffffff",
        padding: "8px 0",
        borderBottom: "1px solid #e5e7eb",
        marginBottom: 12,
    }}
    >
    <div
        style={{
        maxWidth: 960,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 13,
        }}
    >
        <button onClick={() => setBriefPage(briefPage - 1)}>이전</button>
        <span>p. {displayPage}</span> {/* ✅ 여기만 보정 */}
        <button onClick={() => setBriefPage(briefPage + 1)}>다음</button>
    </div>
    </div>

    <img
    src={`${API_BASE}/api/publications/${bookId}/source/page/${briefPage}`}
    style={{ width: "100%" }}
    />
    </div>
  );
}


//law-frontend/app/strategy/Head/HeadRootView.tsx

"use client";

import { useState } from "react";
import { StrategicReadingGuideView } from "./StrategicReadingGuideView";
import { FinalOverviewView } from "./FinalOverviewView";

type HeadPage = "GUIDE" | "OVERVIEW";

const tabStyles = {
  container: {
    display: "flex",
    gap: 32,
    borderBottom: "1px solid #e5e7eb",
    marginBottom: 40,
  },
  
  tab: (active: boolean): React.CSSProperties => ({
    padding: "12px 0",
    fontSize: 15,
    fontWeight: active ? 600 : 400,
    color: active ? "#111827" : "#6b7280",
    cursor: "pointer",
    borderBottom: active ? "3px solid #6d28d9" : "3px solid transparent",
    transition: "color 120ms ease, border-color 120ms ease",
  }),
};

export function HeadRootView({ bookId }: { bookId: string }) {
  const [page, setPage] = useState<HeadPage>("GUIDE");

  return (
    <div>
      {/* 🔝 Head Tabs */}
      <nav style={tabStyles.container}>
        <div
          style={tabStyles.tab(page === "GUIDE")}
          onClick={() => setPage("GUIDE")}
        >
          Strategic Reading Guide
        </div>

        <div
          style={tabStyles.tab(page === "OVERVIEW")}
          onClick={() => setPage("OVERVIEW")}
        >
          Final Overview
        </div>
      </nav>

      {/* 📄 Page Content */}
      <div>
        {page === "GUIDE" && (
          <StrategicReadingGuideView bookId={bookId} />
        )}

        {page === "OVERVIEW" && (
          <FinalOverviewView bookId={bookId} />
        )}
      </div>
    </div>
  );
}

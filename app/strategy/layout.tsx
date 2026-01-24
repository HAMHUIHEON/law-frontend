// law-frontend/app/strategy/layout.tsx

"use client";

import { StrategyUIProvider, useStrategyUI } from "./StrategyUIContext";
import { PublicationSidebar } from "./components/PublicationSidebar";

function StrategyFrame({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useStrategyUI();

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      <PublicationSidebar />

      <main style={{ flex: 1 }}>{children}</main>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed",
            top: 10,          // 헤더 아래
            left: 16,          // 화면 가장자리
            padding: "8px 10px",
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: "pointer",
            zIndex: 1000,
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          ☰ 메뉴
        </button>
      )}
    </div>
  );
}

export default function StrategyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StrategyUIProvider>
      <StrategyFrame>{children}</StrategyFrame>
    </StrategyUIProvider>
  );
}

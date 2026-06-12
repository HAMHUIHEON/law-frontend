"use client";

import { AgentUIProvider } from "./AgentUIContext";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentUIProvider>
      {children}
    </AgentUIProvider>
  );
}

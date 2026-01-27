"use client";

import { usePathname } from "next/navigation";

export function GlobalDisclaimerFooter() {
  const pathname = usePathname();

  const isMain = pathname === "/";
  const isEnter = pathname.startsWith("/enter");
  const isLaw = pathname.startsWith("/law");

  const isPublic = isMain || isEnter;

  return (
    <footer
      style={{
        ...styles.base,
        ...(isPublic ? styles.public : styles.internal),
        ...(isEnter ? styles.enterOffset : {}),
        ...(isLaw ? styles.law : {}),
      }}
    >
      <p
        style={{
          ...styles.textBase,
          ...(isPublic ? styles.textPublic : styles.textInternal),
          ...(isLaw ? styles.textLaw : {}),
        }}
      >
        본 서비스는 AI 기반 정보 제공 도구로, 오류나 누락이 있을 수 있습니다.
        제공 정보는 참고용이며 법률·세무 자문을 대체하지 않습니다.
      </p>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  /* ================= Base ================= */
  base: {
    position: "fixed",
    left: 0,
    bottom: 0,
    width: "100%",
    zIndex: 1000,
  },

  /* ================= Main / Enter ================= */

  public: {
    padding: "24px 16px 32px",
    backgroundColor: "#111827",
  },

  enterOffset: {
    bottom: -24,
  },

  /* ================= Internal (default) ================= */

  internal: {
    padding: "6px 12px",
    backgroundColor: "transparent",
    pointerEvents: "none",
  },

  /* ================= Law ================= */

  law: {
    padding: "4px 12px", // 🔑 높이 최소화
  },

  /* ================= Text ================= */

  textBase: {
    maxWidth: "960px",
    margin: "0 auto",
    textAlign: "center",
    lineHeight: 1.5,
  },

  textPublic: {
    fontSize: "13px",
    letterSpacing: "0.01em",
    color: "rgba(255,255,255,0.4)",
  },

  textInternal: {
    fontSize: "11px",
    color: "rgba(0,0,0,0.35)",
  },

  textLaw: {
    fontSize: "10.5px", // 🔑 더 작게
    lineHeight: 1.4,
    color: "rgba(0,0,0,0.28)", // 🔑 더 약하게
  },
};

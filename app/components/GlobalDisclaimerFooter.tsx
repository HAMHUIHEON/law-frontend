"use client";

import { usePathname } from "next/navigation";

export function GlobalDisclaimerFooter() {
  const pathname = usePathname();

  // 🔑 퍼블릭(메인/분기) vs 서비스 화면 분기
  const isPublic =
    pathname === "/" || pathname.startsWith("/enter");

  return (
    <footer
      style={{
        ...styles.base,
        ...(isPublic ? styles.public : styles.internal),
      }}
    >
      <p
        style={{
          ...styles.textBase,
          ...(isPublic ? styles.textPublic : styles.textInternal),
        }}
      >
        본 서비스는 AI 기반 정보 제공 도구로, 오류나 누락이 있을 수 있습니다.
        제공 정보는 참고용이며 법률·세무 자문을 대체하지 않습니다.
      </p>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  /* 공통 */
  base: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
  },

  /* 🔹 메인 / 분기 페이지 (지금 네가 만족한 상태 유지) */
  public: {
    padding: "24px 16px 32px",
    backgroundColor: "#111827",
  },

  /* 🔹 /cases 같은 화이트 실사용 화면 */
  internal: {
    padding: "6px 12px",
    backgroundColor: "transparent",
    pointerEvents: "none", // 🔑 UX 간섭 완전 제거
  },

  /* 텍스트 공통 */
  textBase: {
    maxWidth: "960px",
    margin: "0 auto",
    textAlign: "center",
    lineHeight: 1.6,
  },

  /* 퍼블릭 화면 텍스트 */
  textPublic: {
    fontSize: "13px",
    letterSpacing: "0.01em",
    color: "rgba(255,255,255,0.4)",
  },

  /* 서비스 화면 텍스트 */
  textInternal: {
    fontSize: "11px",
    color: "rgba(0,0,0,0.35)", // 🔑 흰 배경 전용
  },
};

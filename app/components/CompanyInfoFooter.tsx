// app/components/CompanyInfoFooter.tsx
"use client";

import { usePathname } from "next/navigation";

export function CompanyInfoFooter() {
  const pathname = usePathname();

  const isMain = pathname === "/";
  const isEnter = pathname.startsWith("/enter");
  const isPublic = isMain || isEnter;

  return (
    <footer
      style={{
        ...styles.base,
        ...(isPublic ? styles.public : styles.internal),
        ...(isEnter ? styles.enterOffset : {}),
      }}
    >
      <div style={styles.inner}>
        <p style={{ margin: 0 }}>
          대표: 윤승미 | 사업자등록번호: 584-87-03656 | 
        </p>
        <p style={{ margin: "6px 0 0" }}>
          통신판매업신고번호: 제2026-부산남구-00000호 |
          부산광역시 해운대구 재반로 166 2층 S153
        </p>
        <p style={{ margin: "6px 0 0" }}>
          이메일: yoonseul_m@naver.com
        </p>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // 문서 하단(스크롤 끝)에 자연스럽게 붙는 기본 footer
  base: {
    width: "100%",
    borderTop: "1px solid #e5e7eb",
  },

  internal: {
    padding: "32px 16px 64px",
    backgroundColor: "#fafafa",
    color: "#6b7280",
    fontSize: "12px",
    lineHeight: 1.7,
  },

  // 메인/엔터는 다크 배경에 어울리게
  public: {
    padding: "24px 16px 32px",
    backgroundColor: "#111827",
    color: "rgba(255,255,255,0.45)",
    fontSize: "12px",
    lineHeight: 1.7,
    borderTop: "1px solid rgba(255,255,255,0.12)",
  },

  // enter 페이지는 아래 fixed disclaimer가 살짝 겹치므로 여백 보정
  enterOffset: {
    paddingBottom: "72px",
  },

  inner: {
    maxWidth: 960,
    margin: "0 auto",
    textAlign: "center",
  },
};

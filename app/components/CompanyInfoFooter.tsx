// app/components/CompanyInfoFooter.tsx
"use client";

import { usePathname } from "next/navigation";

export function CompanyInfoFooter() {
  const pathname = usePathname();

  // ❌ footer 숨길 페이지들
  const hideOnFlow = pathname.startsWith("/cases/flow");
  const hideOnStructure = pathname.startsWith("/cases/structure");
  const hideOnPractice = pathname.startsWith("/cases/practice");

  if (hideOnFlow || hideOnStructure || hideOnPractice) {
    return null;
  }

  const isMain = pathname === "/";
  const isEnter = pathname.startsWith("/enter");
  const isMe = pathname.startsWith("/me");
  const isAbout = pathname.startsWith("/about");
  const isFaq = pathname.startsWith("/faq");
  const isTerms = pathname.startsWith("/terms");
  const isPrivacy = pathname.startsWith("/privacy");

  const isPublic =
    isMain ||
    isEnter ||
    isMe ||
    isAbout ||
    isFaq ||
    isTerms ||
    isPrivacy;

  return (
    <footer
      style={{
        ...styles.base,
        ...(isPublic ? styles.public : styles.internal),
        ...(isPublic ? styles.enterOffset : {}),
      }}
    >
      <div style={styles.inner}>
        <p style={{ margin: 0 }}>
          윤슬 · 사업자등록번호 000-00-00000 · 통신판매업신고번호
          제2026-부산남구-00000호
        </p>
        <p style={{ margin: "4px 0 0" }}>
          부산광역시 해운대구 재반로 166, 2층 S153호 · 대표자 윤승미 ·
          문의 yoonseul_m@naver.com
        </p>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
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

  public: {
    padding: "24px 16px 32px",
    backgroundColor: "#111827",
    color: "rgba(255,255,255,0.45)",
    fontSize: "12px",
    lineHeight: 1.7,
    borderTop: "1px solid rgba(255,255,255,0.12)",
  },

  enterOffset: {
    paddingBottom: "72px",
  },

  inner: {
    maxWidth: 960,
    margin: "0 auto",
    textAlign: "center",
  },
};

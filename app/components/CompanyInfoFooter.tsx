// app/components/CompanyInfoFooter.tsx
"use client";

export function CompanyInfoFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid #e5e7eb",
        padding: "32px 16px 64px",
        backgroundColor: "#fafafa",
        color: "#6b7280",
        fontSize: "12px",
        lineHeight: 1.7,
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <p>
          대표: 윤승미
          <br />
          사업자등록번호: 000-00-00000
          </p>

        <p style={{ marginTop: 8 }}>
          통신판매업신고번호: 제2026-부산남구-00000호
        </p>

        <p style={{ marginTop: 8 }}>
          부산광역시 해운대구 재반로 166 2층 S153
        </p>

        <p style={{ marginTop: 8 }}>
          이메일:yoonseul_m@naver.com
        </p>
      </div>
    </footer>
  );
}

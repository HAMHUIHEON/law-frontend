// law-frontend/app/privacy/page.tsx

import Link from "next/link";

export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <main style={styles.container}>
      <section style={styles.section}>
        <div style={styles.homeWrapper}>
          <Link href="/enter" style={styles.homeLink}>
            HOME
          </Link>
        </div>

        <h1 style={styles.title}>개인정보처리방침</h1>

        {/* 개인정보 수집 */}
        <div style={styles.block}>
          <h3 style={styles.blockTitle}>개인정보 수집 항목</h3>

          <p style={styles.paragraph}>
            본 서비스는 서비스 제공을 위해
            다음과 같은 개인정보를 수집합니다.
          </p>

          <ul style={styles.list}>
            <li>회원 식별을 위한 정보 (계정 ID 등)</li>
            <li>서비스 이용 기록</li>
            <li>
              결제 관련 정보  
              <br />
              <span style={styles.subText}>
                (결제는 결제 대행사를 통해 처리되며,
                결제 수단 정보는 직접 저장하지 않습니다.)
              </span>
            </li>
          </ul>
        </div>

        {/* 개인정보 이용 목적 */}
        <div style={styles.block}>
          <h3 style={styles.blockTitle}>개인정보 이용 목적</h3>

          <p style={styles.paragraph}>
            수집된 개인정보는 다음의 목적에 한하여 이용됩니다.
          </p>

          <ul style={styles.list}>
            <li>서비스 제공 및 기능 운영</li>
            <li>이용자 식별 및 이용 관리</li>
            <li>결제 처리 및 고객 문의 응대</li>
          </ul>

          <p style={styles.notice}>
            위 목적 외의 용도로는 개인정보를 이용하지 않습니다.
          </p>
        </div>

        {/* 보호 및 관리 */}
        <div style={styles.block}>
          <h3 style={styles.blockTitle}>개인정보 보호 및 관리</h3>

          <p style={styles.paragraph}>
            본 서비스는 개인정보 보호 관련 법령을 준수하며,
            수집된 개인정보를 안전하게 관리합니다.
          </p>

          <p style={styles.notice}>
            개인정보의 처리 및 보호와 관련한 사항은
            관련 법령 및 본 방침을 기준으로 합니다.
          </p>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    padding: "96px 24px 140px",
  },
  section: {
    maxWidth: "960px",
    margin: "0 auto",
  },
  homeWrapper: {
    marginBottom: "32px",
    marginTop: "-16px",
  },
  homeLink: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.55)",
    textDecoration: "none",
    letterSpacing: "0.02em",
  },
  title: {
    fontSize: "28px",
    fontWeight: 600,
    marginBottom: "40px",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: "-0.01em",
  },

  block: {
    marginBottom: "48px",
  },
  blockTitle: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "16px",
    color: "rgba(255,255,255,0.9)",
  },
  paragraph: {
    fontSize: "15px",
    lineHeight: 1.9,
    color: "rgba(255,255,255,0.75)",
    marginBottom: "16px",
  },
  list: {
    paddingLeft: "18px",
    lineHeight: 1.9,
    fontSize: "15px",
    color: "rgba(255,255,255,0.75)",
    marginBottom: "12px",
  },
  subText: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.55)",
  },
  notice: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.7,
  },
};

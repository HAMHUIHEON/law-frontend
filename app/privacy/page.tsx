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

        <div style={styles.content}>
          <h3>개인정보 처리 안내</h3>

          <p>본 서비스는 다음과 같은 개인정보를 수집합니다.</p>
          <ul>
            <li>회원 식별을 위한 정보 (계정 ID 등)</li>
            <li>서비스 이용 기록</li>
            <li>
              결제 관련 정보
              <br />
              (결제는 결제 대행사를 통해 처리되며,
              회사는 결제 수단 정보를 직접 저장하지 않습니다.)
            </li>
          </ul>

          <p>
            수집된 개인정보는
            <strong> 서비스 제공, 이용 관리, 고객 응대 목적</strong>
            외에는 사용되지 않습니다.
          </p>

          <p>
            회사는 개인정보 보호 관련 법령을 준수하며,
            개인정보를 안전하게 관리합니다.
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
    marginBottom: "32px",
    color: "rgba(255,255,255,0.9)",
  },
  content: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.8,
  },
};

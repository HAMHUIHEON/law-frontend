// law-frontend/app/terms/page.tsx

import Link from "next/link";

export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <main style={styles.container}>
      <section style={styles.section}>
        <div style={styles.homeWrapper}>
          <Link href="/enter" style={styles.homeLink}>
            HOME
          </Link>
        </div>

        <h1 style={styles.title}>이용약관</h1>

        <div style={styles.content}>
          <h3>이용약관 요약</h3>
          <ul>
            <li>본 서비스는 정보 제공을 목적으로 합니다.</li>
            <li>
              서비스 이용 및 그 결과에 대한 책임은
              <strong> 이용자에게 귀속</strong>됩니다.
            </li>
            <li>
              회사는 제공 정보의 정확성·완전성을
              <strong> 보장하지 않습니다.</strong>
            </li>
            <li>
              회사는 서비스 내용 및 기능을
              사전 고지 후 변경할 수 있습니다.
            </li>
            <li>
              계정 공유 및 부정 사용은
              서비스 이용이 제한될 수 있습니다.
            </li>
          </ul>

          <p style={styles.notice}>
            자세한 이용약관 전문은 본 페이지의 내용을 기준으로 합니다.
          </p>

          <hr />

          <h3>환불 정책</h3>
          <ul>
            <li>결제일로부터 <strong>7일 이내</strong></li>
            <li>
              <strong>서비스 이용 기록이 없는 경우에 한해</strong> 환불 가능
            </li>
            <li>서비스 이용 이력이 있는 경우 환불 불가</li>
            <li>
              구독 해지 시에도
              결제 기간 종료일까지 이용 가능
            </li>
          </ul>

          <p style={styles.notice}>
            환불 요청은 고객센터 또는
            회사가 지정한 방법을 통해 접수할 수 있습니다.
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
  notice: {
    marginTop: "12px",
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
  },
};

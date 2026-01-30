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

        {/* 이용약관 요약 */}
        <div style={styles.block}>
          <h3 style={styles.blockTitle}>이용약관 요약</h3>

          <p style={styles.paragraph}>
            본 서비스는 판례·법령·전략 자료에 대한
            <strong> 분석 및 정보 제공을 목적</strong>으로 합니다.
          </p>

          <ul style={styles.list}>
            <li>
              서비스 이용 및 그 결과에 대한 책임은
              <strong> 이용자 본인에게 귀속</strong>됩니다.
            </li>
            <li>
              제공되는 정보의 정확성·완전성·최신성에 대해
              <strong> 보장하지 않습니다.</strong>
            </li>
            <li>
              서비스의 내용, 기능, 구성은
              사전 고지 후 변경될 수 있습니다.
            </li>
            <li>
              계정 공유, 자동화 접근, 부정 사용이 확인될 경우
              서비스 이용이 제한될 수 있습니다.
            </li>
          </ul>

          <p style={styles.notice}>
            본 요약은 이해를 돕기 위한 안내이며,
            본 페이지의 전체 내용이 약관으로 적용됩니다.
          </p>
        </div>

        {/* 환불 정책 */}
        <div style={styles.block}>
          <h3 style={styles.blockTitle}>환불 정책</h3>

          <p style={styles.paragraph}>
            구독 결제에 대한 환불은 아래 기준에 따라 처리됩니다.
          </p>

          <ul style={styles.list}>
            <li>
              결제일로부터 <strong>7일 이내</strong>
            </li>
            <li>
              <strong>서비스 이용 이력이 없는 경우에 한해</strong> 환불 가능
            </li>
            <li>
              서비스 이용 이력이 있는 경우 환불 불가
            </li>
            <li>
              구독 해지 시에도
              결제된 이용 기간 종료일까지는 서비스 이용 가능
            </li>
          </ul>

          <p style={styles.notice}>
            환불 요청은 고객센터 또는
            운영자가 안내한 방법을 통해 접수할 수 있습니다.
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
    listStyleType: "disc"
  },
  notice: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.7,
  },
};

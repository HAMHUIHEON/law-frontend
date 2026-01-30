// law-frontend/app/about/page.tsx

import Link from "next/link";

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <main style={styles.container}>
      <section style={styles.section}>
        <Link href="/enter" style={styles.homeLink}>
          HOME
        </Link>

        {/* HERO */}
        <header style={styles.hero}>
          <h1 style={styles.title}>About · What we do</h1>
          <p style={styles.heroDesc}>
            이 서비스는 법률 자료를{" "}
            <strong>‘정보’가 아니라 ‘사고의 구조’로 이해하기 위한 분석 도구</strong>
            입니다.
          </p>
        </header>

        {/* HOW */}
        <section style={styles.block}>
          <p>
            단순히 판결 요지를 요약하거나 조문과 키워드를 나열하는 데서
            멈추지 않고,
          </p>

          <ul style={styles.list}>
            <li>쟁점이 어떻게 설정되었는지</li>
            <li>판단이 어떤 순서로 진행되는지</li>
            <li>논증이 어디에서 갈리고, 어디에서 결정되는지</li>
          </ul>

          <p>
            <strong>구조적으로 정리하여 보여줍니다.</strong>
          </p>
        </section>

        {/* WHAT */}
        <section style={styles.block}>
          <h2 style={styles.subTitle}>What we analyze</h2>

          <ul style={styles.featureList}>
            <li style={styles.featureItem}>
              <strong style={styles.featureTitle}>판례</strong>
              <span style={styles.featureDesc}>
                법원이 결론에 이르기까지의 판단 구조와 논증 흐름
              </span>
            </li>

            <li style={styles.featureItem}>
              <strong style={styles.featureTitle}>법령</strong>
              <span style={styles.featureDesc}>
                조문의 요건·효과·예외를 판단 순서에 따라 정리
              </span>
            </li>

            <li style={styles.featureItem}>
              <strong style={styles.featureTitle}>전략 자료</strong>
              <span style={styles.featureDesc}>
                정책·전략 문헌(OECD 등)을 사고 구조 단위로 재구성
              </span>
            </li>
          </ul>
        </section>

        {/* WHO */}
        <section style={styles.block}>
          <h2 style={styles.subTitle}>Who it’s for</h2>
          <p>
            본 서비스는 법률 실무자, 연구자, 로스쿨·공무원·전문자격 시험
            수험생 등<br />
            법률 자료를 반복적으로 읽고 분석해야 하는 사용자를 위해
            설계되었습니다.
          </p>
        </section>

        {/* DISCLAIMER */}
        <section style={styles.disclaimer}>
          ⚠️ 본 서비스는 법률 자문이나 법적 판단을 제공하지 않으며,
          판례·법령·전략 자료에 대한{" "}
          <strong>분석을 보조하는 정보 제공 도구</strong>입니다.
        </section>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    padding: "96px 24px 140px",
    color: "rgba(255,255,255,0.85)",
  },
  section: {
    maxWidth: 920,
    margin: "0 auto",
  },
  homeLink: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    textDecoration: "none",
    display: "inline-block",
    marginBottom: 32,
  },
  hero: {
    marginBottom: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    marginBottom: 16,
  },
  heroDesc: {
    fontSize: 17,
    lineHeight: 1.9,
    color: "rgba(255,255,255,0.7)",
    maxWidth: 720,
  },
  block: {
    marginBottom: 64,
    fontSize: 15,
    lineHeight: 1.9,
    color: "rgba(255,255,255,0.75)",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
    color: "rgba(255,255,255,0.9)",
  },
  list: {
    paddingLeft: 20,
    margin: "16px 0",
    lineHeight: 1.8,
    listStyleType: "disc",  
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    display: "grid",
    gap: 16,
  },
  disclaimer: {
    marginTop: 72,
    paddingTop: 24,
    borderTop: "1px solid rgba(255,255,255,0.15)",
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.8,
  },
  featureItem: {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  paddingLeft: 12,
  borderLeft: "2px solid rgba(255,255,255,0.25)",
  },

  featureTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "rgba(255,255,255,0.9)",
  },

  featureDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.6,
  },

};

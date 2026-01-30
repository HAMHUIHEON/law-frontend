// law-frontend/app/about/page.tsx

import Link from "next/link";

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <main style={styles.container}>
      <section style={styles.section}>
        <div style={styles.homeWrapper}>
          <Link href="/enter" style={styles.homeLink}>
            HOME
          </Link>
        </div>

        <h1 style={styles.title}>About · What we do</h1>

        <div style={styles.content}>
          <p>
            이 서비스는 법률 자료를{" "}
            <strong>‘정보’가 아니라 ‘사고의 구조’로 이해하기 위한 분석 도구</strong>
            입니다.
          </p>

          <p>
            단순히 판결 요지를 요약하거나 조문과 키워드를 나열하는 데서
            멈추지 않고,
          </p>

          <ul>
            <li>쟁점이 어떻게 설정되었는지</li>
            <li>판단이 어떤 순서로 진행되는지</li>
            <li>논증이 어디에서 갈리고, 어디에서 결정되는지</li>
          </ul>

          <p>
            를 <strong>구조적으로 정리하여 보여줍니다.</strong>
          </p>

          <p>본 서비스는 다음과 같은 자료를 다룹니다.</p>

          <ul>
            <li>
              <strong>판례</strong>: 법원이 결론에 이르기까지의 판단 구조와
              논증 흐름
            </li>
            <li>
              <strong>법령</strong>: 조문의 요건·효과·예외를 판단 순서에 따라
              정리
            </li>
            <li>
              <strong>전략 자료</strong>: 정책·전략 문헌(OECD 등)을 사고 구조
              단위로 재구성
            </li>
          </ul>

          <p>
            이를 통해 사용자는 개별 자료를 넘어서{" "}
            <strong>법적 사고의 기준과 흐름</strong>을 파악할 수 있습니다.
          </p>

          <p>
            본 서비스는 법률 실무자, 연구자, 로스쿨·공무원·전문자격 시험
            수험생 등 법률 자료를 반복적으로 읽고 분석해야 하는 사용자를
            위해 설계되었습니다.
          </p>

          <p style={styles.disclaimer}>
            ⚠️ 본 서비스는 법률 자문이나 법적 판단을 제공하지 않으며,
            판례·법령·전략 자료에 대한{" "}
            <strong>분석을 보조하는 정보 제공 도구</strong>입니다.
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
    letterSpacing: "-0.01em",
  },
  content: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.8,
  },
  disclaimer: {
    marginTop: "32px",
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.7,
  },
};

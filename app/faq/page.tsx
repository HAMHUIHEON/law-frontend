// law-frontend/app/faq/page.tsx

import Link from "next/link";

export const dynamic = "force-static";

export default function FAQPage() {
  return (
    <main style={styles.container}>
      <section style={styles.section}>
        <div style={styles.homeWrapper}>
          <Link href="/enter" style={styles.homeLink}>
            HOME
          </Link>
        </div>

        <h1 style={styles.title}>FAQ</h1>

        <div style={styles.content}>
          <h3>Q. 이 서비스는 어떤 사람을 위한 건가요?</h3>
          <p>
            이 서비스는 판례나 법령을 빠르게 소비하려는 분보다는,
            <br />
            <strong>
              자료의 구조와 판단 흐름을 깊이 이해하려는 사용자
            </strong>
            를 위한 서비스입니다.
          </p>
          <p>다음과 같은 분들을 주요 대상으로 설계되었습니다.</p>
          <ul>
            <li>법률 실무자</li>
            <li>법학 연구자</li>
            <li>로스쿨·공무원·전문자격 시험 수험생</li>
          </ul>

          <hr />

          <h3>Q. 무료 이용과 유료 이용의 차이는 무엇인가요?</h3>
          <p>
            무료 이용자는 일부 기능만 제한적으로 이용할 수 있습니다.
            <br />
            유료 구독자는 판례·법령·전략 분석 기능을
            <strong> 월간 이용 한도 내에서 </strong>
            이용할 수 있습니다.
          </p>
          <p>
            구체적인 이용 범위와 제한 사항은
            <br />
            구독 안내 페이지에 명시된 내용을 기준으로 합니다.
          </p>

          <hr />

          <h3>Q. 판례 원문을 제공하나요?</h3>
          <p>
            아니요.
            <br />
            본 서비스는 판례 원문을 제공하지 않습니다.
          </p>
          <p>
            공개된 판례를 바탕으로
            <br />
            쟁점 설정, 판단 구조, 논증 흐름을
            <strong> 분석·정리한 결과만 제공합니다.</strong>
          </p>

          <hr />

          <h3>Q. 법률 자문 서비스인가요?</h3>
          <p>
            아니요.
            <br />
            본 서비스는 법률 자문, 법적 판단,
            사건에 대한 의견 제시를 하지 않습니다.
          </p>
          <p>
            제공되는 모든 콘텐츠는
            <strong> 정보 제공 및 학습·연구 목적</strong>에 한정됩니다.
          </p>

          <hr />

          <h3>Q. 분석 결과를 그대로 사용해도 되나요?</h3>
          <p>
            본 서비스에서 제공되는 분석 결과는
            참고 자료로서 제공됩니다.
          </p>
          <p>
            실제 사건, 업무, 제출 문서 등에 활용할 경우
            <br />
            이용자 본인의 판단과 검토가 필요합니다.
          </p>

          <hr />

          <h3>Q. 해지하면 바로 이용이 중단되나요?</h3>
          <p>
            아니요.
            <br />
            구독을 해지하더라도
            이미 결제된 이용 기간이 종료될 때까지는
            정상적으로 서비스를 이용할 수 있습니다.
          </p>

          <hr />

          <h3>Q. 환불은 언제 가능한가요?</h3>
          <p>환불 정책은 다음과 같습니다.</p>
          <ul>
            <li>결제 후 <strong>7일 이내</strong></li>
            <li>
              <strong>서비스 이용 이력이 없는 경우에 한해</strong> 환불 가능
            </li>
            <li>서비스 이용 이력이 있는 경우 환불 불가</li>
            <li>이용 기간이 경과한 이후에는 환불 불가</li>
          </ul>

          <p style={styles.notice}>
            자세한 내용은 이용약관 및 환불 정책을 참고해 주세요.
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
  notice: {
    marginTop: "12px",
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
  },
};

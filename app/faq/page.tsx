// law-frontend/app/faq/page.tsx

import Link from "next/link";

export const dynamic = "force-static";

export default function FAQPage() {
  return (
    <main style={styles.container}>
      <section style={styles.section}>
        <Link href="/enter" style={styles.homeLink}>
          HOME
        </Link>

        <header style={styles.header}>
          <h1 style={styles.title}>FAQ</h1>
          <p style={styles.desc}>
            서비스 이용과 관련해 자주 문의되는 내용을 정리했습니다.
          </p>
        </header>

        {/* Q1 */}
        <div style={styles.faqItem}>
          <h3 style={styles.question}>
            이 서비스는 어떤 사람을 위한 건가요?
          </h3>
          <div style={styles.answer}>
            <p>
              이 서비스는 판례나 법령을 빠르게 소비하려는 분보다는,
              <br />
              <strong>자료의 구조와 판단 흐름을 깊이 이해하려는 사용자</strong>
              를 위한 서비스입니다.
            </p>
            <ul>
              <li> · 법률 실무자 </li>
              <li> · 법학 연구자 </li>
              <li> · 로스쿨·공무원·전문자격 시험 수험생 </li>
            </ul>
          </div>
        </div>

        {/* Q2 */}
        <div style={styles.faqItem}>
          <h3 style={styles.question}>
            무료 이용과 유료 이용의 차이는 무엇인가요?
          </h3>
          <div style={styles.answer}>
            <p>
              무료 이용자는 일부 기능만 제한적으로 이용할 수 있으며,
              <br />
              유료 구독자는 판례·법령·전략 분석 기능을
              <strong> 월간 이용 한도 내에서 </strong>
              이용할 수 있습니다.
            </p>
            <p>
              구체적인 이용 범위는 구독 안내 페이지에 명시된 내용을
              기준으로 합니다.
            </p>
          </div>
        </div>

        {/* Q3 판례 원문을 제공하나요? */}
        <div style={styles.faqItem}>
          <h3 style={styles.question}>판례 원문을 제공하나요?</h3>
          <div style={styles.answer}>
            <p>
              아니요. 본 서비스는 판례 원문을 제공하지 않습니다.
            </p>
            <p>
              공개된 판례를 바탕으로 쟁점 설정, 판단 구조, 논증 흐름을
              <strong> 분석·정리한 결과만 제공합니다.</strong>
            </p>
          </div>
        </div>

        {/* Q4. 업로드한 판례 원문은 어떻게 관리되나요? */}
        <div style={styles.faqItem}>
          <h3 style={styles.question}>
            업로드한 판례 원문은 어떻게 관리되나요?
          </h3>
          <div style={styles.answer}>
          <p>
            이용자가 업로드한 판례 원문은
            <strong> 원문 형태로 데이터베이스에 저장되지 않습니다.</strong>
          </p>
          <p>
            업로드된 자료는
            <strong> 분석 과정에서만 처리되며,</strong>
            <br />
            이후에는
            <strong> 쟁점, 판단 구조, 논증 흐름 등 가공·정리된 분석 결과만</strong>
            데이터베이스에 저장됩니다.
          </p>
          <p>
            본 서비스는 판례 원문의 보관이나 열람을 목적으로 하지 않으며,
            <br />
            <strong>사고 구조 분석을 위한 처리 과정</strong>에 한정하여
            자료를 활용합니다.
          </p>
          </div>
        </div>

        {/* Q. 제가 업로드한 판례의 분석 결과를 다른 사람도 볼 수 있나요? */}
        <div style={styles.faqItem}>
          <h3 style={styles.question}>
            제가 업로드한 판례의 분석 결과를 다른 사람도 볼 수 있나요?
          </h3>
          <div style={styles.answer}>
            <p>
              네. 분석을 통해 생성된 결과는
              <strong> 서비스 내 콘텐츠로 활용될 수 있습니다.</strong>
            </p>
            <p>
              다만, 이 경우에도
              <strong>
                이용자가 업로드한 판례 원문 자체나,
                해당 자료를 누가 업로드했는지에 대한 정보는
                다른 이용자에게 제공되지 않습니다.
              </strong>
            </p>
            <p>
              제공되는 분석 결과는
              <strong>
                특정 이용자의 업로드 행위와 분리된 형태의
                일반적인 분석 자료
              </strong>
              로 활용됩니다.
            </p>
            <p>
              판례 원문에 포함된 내용 중
              공개 범위나 활용에 대해 판단이 필요한 정보가 있는 경우에는,
              <br />
              <strong>
                이용자가 사전에 비식별 처리 등을 거친 자료를
                업로드하는 것을 권장합니다.
              </strong>
            </p>
          </div>
        </div>
        
        {/* Q5. 왜 국제조세조정법만 다루고 있나요? */}
        <div style={styles.faqItem}>
          <h3 style={styles.question}>
            왜 국제조세조정법만 다루고 있나요? 다른 법률은 제공되지 않나요?
          </h3>
          <div style={styles.answer}>
            <p>
              현재 법률 영역에서는
              <strong> 국제조세조정법을 중심으로 한 콘텐츠</strong>를 제공하고 있습니다.
            </p>
            <p>
              이는 특정 법률 분야를 얕게 확장하기보다,
              <br />
              <strong>하나의 영역을 깊이 있게 구조화하고 분석하는 데 집중하기 위한
              단계적 운영 전략</strong>에 따른 것입니다.
            </p>
            <p>
              다른 조세 법률이나 법률 분야에 대한 콘텐츠는
              <br />
              향후 서비스 고도화 및 데이터 축적 상황에 따라
              <strong>순차적으로 확장될 예정</strong>입니다.
            </p>
          </div>
        </div>

        {/* Q6 */}
        <div style={styles.faqItem}>
          <h3 style={styles.question}>법률 자문 서비스인가요?</h3>
          <div style={styles.answer}>
            <p>
              아니요. 본 서비스는 법률 자문, 법적 판단,
              사건에 대한 의견 제시를 하지 않습니다.
            </p>
            <p>
              제공되는 모든 콘텐츠는
              <strong> 정보 제공 및 학습·연구 목적</strong>에 한정됩니다.
            </p>
          </div>
        </div>

          {/* Q7. 분석 결과를 그대로 사용해도 되나요? */}
          <div style={styles.faqItem}>
            <h3 style={styles.question}>
              분석 결과를 그대로 사용해도 되나요?
            </h3>
            <div style={styles.answer}>
              <p>
                본 서비스에서 제공되는 분석 결과는
                <strong> 참고 자료로서 제공됩니다.</strong>
              </p>
              <p>
                실제 사건, 업무, 제출 문서 등에 활용할 경우에는
                <br />
                이용자 본인의 판단과 추가적인 검토가 필요합니다.
              </p>
            </div>
          </div>

          {/* Q8. 콘텐츠는 얼마나 자주 업데이트되나요? */}
          <div style={styles.faqItem}>
            <h3 style={styles.question}>
              콘텐츠는 얼마나 자주 업데이트되나요?
            </h3>
            <div style={styles.answer}>
              <p>
                콘텐츠 업데이트 주기는
                <strong> 법령 개정, 판례 축적, 분석 필요성</strong>을 종합적으로 고려해
                결정됩니다.
              </p>
              <p>
                모든 변경 사항을 실시간으로 반영하기보다는,
                <br />
                <strong>분석 가치가 충분한 시점에 선별적으로 업데이트</strong>하는
                방식을 취하고 있습니다.
              </p>
            </div>
          </div>

        {/* Q9 */}
        <div style={styles.faqItem}>
          <h3 style={styles.question}>해지하면 바로 이용이 중단되나요?</h3>
          <div style={styles.answer}>
            <p>
              아니요. 구독을 해지하더라도
              이미 결제된 이용 기간이 종료될 때까지는
              정상적으로 서비스를 이용할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Q10 */}
        <div style={styles.faqItem}>
          <h3 style={styles.question}>환불은 언제 가능한가요?</h3>
          <div style={styles.answer}>
            <ul>
              <li>결제 후 <strong>7일 이내</strong></li>
              <li>
                <strong>서비스 이용 이력이 없는 경우에 한해</strong> 환불 가능
              </li>
              <li>서비스 이용 이력이 있는 경우 환불 불가</li>
              <li>이용 기간 경과 후 환불 불가</li>
            </ul>
            <p style={styles.notice}>
              자세한 내용은 이용약관 및 환불 정책을 참고해 주세요.
            </p>
          </div>
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
    color: "rgba(255,255,255,0.85)",
  },
  section: {
    maxWidth: 880,
    margin: "0 auto",
  },
  homeLink: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    textDecoration: "none",
    display: "inline-block",
    marginBottom: 32,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 12,
  },
  desc: {
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
  },
  faqItem: {
    marginBottom: 48,
  },
  question: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
    color: "rgba(255,255,255,0.95)",
  },
  answer: {
    fontSize: 15,
    lineHeight: 1.9,
    color: "rgba(255,255,255,0.75)",
    paddingLeft: 4,
  },
  notice: {
    marginTop: 12,
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
  },
};


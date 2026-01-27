"use client";

export function GlobalDisclaimerFooter() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>
        본 서비스는 AI 기반 정보 제공 도구이며, 법률적·세무적 자문을
        대체하지 않습니다. 중요한 의사결정은 반드시 전문가와 상담하시기
        바랍니다.
      </p>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    width: "100%",
    padding: "24px 16px 32px",
    backgroundColor: "transparent",
  },
  text: {
    maxWidth: "960px",
    margin: "0 auto",
    fontSize: "12px",
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },
};

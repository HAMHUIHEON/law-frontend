"use client";

export function GlobalDisclaimerFooter() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>
        본 서비스는 AI 기반 정보 제공 도구로, 오류나 누락이 있을 수 있습니다.
        제공 정보는 참고용이며 법률·세무 자문을 대체하지 않습니다.
      </p>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    position: "fixed",        // 🔑 핵심
    width: "100%",
    padding: "24px 16px 32px",
    backgroundColor: "#111827",
  },
  text: {
    maxWidth: "960px",
    margin: "0 auto",
    fontSize: "13px",
    lineHeight: 1.6,
    letterSpacing: "0.01em",
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },
};

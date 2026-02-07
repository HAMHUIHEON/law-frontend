// law-frontend/app/page.tsx

import Link from "next/link";

export default function PublicHome() {
  return (
    <main style={styles.container}>
      <div style={styles.center}>
        <div style={styles.brand}>LAPIS NEXUS</div>
        <h1 style={styles.title}>
          Where thought flows, sharpens, and extends.
        </h1>
        <p style={styles.subtitle}>
          생각의 흐름 속에서 사고를 정제하고 확장하는 공간
        </p>

        <Link href="/enter" style={styles.enter}>
          Enter
        </Link>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#111827", // lapis 계열 다크 네이비
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: "160px", // 🔑 footer 영역 확보
  },
  center: {
    textAlign: "center",
    padding: "0 24px",
    maxWidth: "840px",
  },
brand: {
  fontSize: "17px",          // ← 12px → 14px
  letterSpacing: "0.32em",   // ← 살짝만 더 벌림
  fontWeight: 500,
  color: "rgba(255,255,255,0.55)", // ← 0.45 → 0.55
  marginBottom: "36px",      // ← 숨 쉴 공간만 약간 추가
  textTransform: "uppercase",
},
  title: {
    fontSize: "42px",
    fontWeight: 500,
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
    color: "rgba(255,255,255,0.92)",
    marginBottom: "20px",
    whiteSpace: "nowrap",      // 🔑 핵심
  },
  subtitle: {
    fontSize: "16px",
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.6)",
    marginBottom: "64px",
  },
  enter: {
    display: "inline-block",
    fontSize: "14px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)",
    textDecoration: "none",
    paddingBottom: "2px",
    borderBottom: "1px solid rgba(255,255,255,0.35)",
    transition: "color 160ms ease, border-color 160ms ease",
    transform: "translateX(-2px)", // ← 여기
  },
};

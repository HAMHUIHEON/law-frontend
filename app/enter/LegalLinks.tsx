// law-frontend/app/enter/LegalLinks.tsx
"use client";

import Link from "next/link";

export function LegalLinks() {
  return (
    <nav style={styles.wrap}>
      <Link
        href="/about"
        style={styles.link}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.85)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
        }
      >
        About
      </Link>

      <span style={styles.dot}>·</span>

      <Link
        href="/faq"
        style={styles.link}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.85)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
        }
      >
        FAQ
      </Link>

      <span style={styles.dot}>·</span>

      <Link
        href="/terms"
        style={styles.link}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.85)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
        }
      >
        Terms
      </Link>

      <span style={styles.dot}>·</span>

      <Link
        href="/privacy"
        style={styles.link}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.85)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
        }
      >
        Privacy
      </Link>
    </nav>
  );
}


const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: "absolute",
    top: 20,
    left: 20,
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    zIndex: 50,
  },
  link: {
    color: "rgba(255,255,255,0.55)",
    textDecoration: "none",
    letterSpacing: "0.02em",
    transition: "color 120ms ease",
  },
  dot: {
    color: "rgba(255,255,255,0.3)",
  },
};

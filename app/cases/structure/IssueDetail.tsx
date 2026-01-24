// app/cases/structure/IssueDetail.tsx
"use client";

type Props = {
  issue: {
    title: string;
    plaintiff: string[];
    defendant: string[];
    court: string[];
  } | null;
  onSave?: () => void;   // ✅ 저장 콜백만 받음
};

export function IssueDetail({ issue, onSave }: Props) {
  if (!issue) return null;

  return (
    <section className="ui-scroll" style={styles.issueDetail}>
      {/* 카드 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
          {issue.title}
        </h3>
        {onSave && (
          <button
            onClick={onSave}
            style={{
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              color: "#374151",
              cursor: "pointer",
              transition: "all 120ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#9ca3af";
              e.currentTarget.style.color = "#111827";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#374151";
            }}
          >
            저장
          </button>
        )}
      </div>
      <Block title="🧑‍⚖️ 원고 주장" items={issue.plaintiff} />
      <Block title="🏛️ 피고 주장" items={issue.defendant} />
      <Block title="⚖️ 법원의 판단" items={issue.court} />
    </section>
  );
}

function Block({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section style={styles.block}>
      <h3 style={styles.blockTitle}>{title}</h3>
      {items.length === 0 ? (
        <p style={styles.empty}>내용 없음</p>
      ) : (
        items.map((text, i) => (
          <p key={i} style={styles.blockText}>
            {text}
          </p>
        ))
      )}
    </section>
  );
}
const styles = {

  caseNumber: {
  fontSize: "13.5px",
  fontWeight: 600,
  color: "#047857", // 짙은 초록 (emerald-700 계열)
  marginBottom: "2px",
  letterSpacing: "0.02em",
},

  container: {
    padding: "36px 12px",
    backgroundColor: "#f5f6f8",
    minHeight: "100vh",
  },

  title: {
    fontSize: "28px",
    fontWeight: 600,
    marginBottom: "20px",
  },

  summaryBox: {
    width: "100%",
    marginBottom: "32px",
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",

  },

  layout: {
    display: "flex",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  issueList: {
    width: "240px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "12px",
    maxHeight: "70vh",
    overflowY: "auto" as const,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",

  },

  issueButton: {
    width: "100%",
    textAlign: "left" as const,
    padding: "10px 12px",
    fontSize: "13.5px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent", // ✅ background 말고 backgroundColor
    cursor: "pointer",
    color: "#374151",
  },

  issueActive: {
    backgroundColor: "#ecfdf5",
    color: "#065f46",
    fontWeight: 600,
  },

  issueDetail: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    maxHeight: "70vh",
    overflowY: "auto" as const,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",

  },

  issueTitle: {
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: "20px",
  },

  block: {
    marginBottom: "24px",
  },

  blockTitle: {
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "8px",
  },

  blockText: {
    fontSize: "13px",
    lineHeight: 1.8,
    marginBottom: "10px",
    color: "#374151",
    whiteSpace: "pre-wrap" as const,
  },
  empty: {
    fontSize: "13px",
    color: "#9ca3af",
  },
link: {
  cursor: "pointer",
  textDecoration: "underline",
},

summaryTabs: {
  display: "flex",
  gap: "28px",
  borderBottom: "1px solid #e5e7eb",
  marginBottom: "16px",

},

tab: {
  fontSize: "14px",
  paddingBottom: "10px",
  background: "none",
  border: "none",                 // ← 항상 동일
  borderBottomWidth: "2px",
  borderBottomStyle: "solid" as const,
  borderBottomColor: "transparent",
  color: "#6b7280",
  cursor: "pointer",
},

  backButton: {
    fontSize: "14px",
    color: "#374151",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    marginTop: "12px",
    padding: "8px 6px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },

activeTab: {
  fontSize: "15px",
  paddingBottom: "10px",
  background: "none",
  border: "none",                 // ← 항상 동일
  borderBottomWidth: "2px",
  borderBottomStyle: "solid" as const,
  borderBottomColor: "#065f46",
  color: "#111827",
  fontWeight: 600,
},
pageFrame: {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 24px",
},

summaryContent: {
  fontSize: "14px",
  lineHeight: 1.9,
  color: "#374151",
  maxWidth: "880px",
},

};

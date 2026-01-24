// law-frontend/app/cases/practice/styles.ts
import type React from "react";

export const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "36px 24px",
    backgroundColor: "#f5f6f8",
    minHeight: "100vh",
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

  pageFrame: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  summaryBox: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    marginBottom: "48px",
  },

  title: {
    fontSize: "28px",
    fontWeight: 600,
    marginBottom: "30px",
  },

  section: {
    marginBottom: "32px",
  },

  sectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "5px",
  },

  subTitle: {
    fontSize: "15px",
    fontWeight: 600,
    marginTop: "16px",
    marginBottom: "10px",
  },

  paragraph: {
    fontSize: "14px",
    lineHeight: "1.8",
    color: "#374151",
    fontWeight: 400,
    marginBottom: "10px",
  },

  chainSection: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  chainTitle: {
    fontSize: "20px",
    fontWeight: 700,
    marginBottom: "24px",
  },

  bulletRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "10px",
  },

  bullet: {
    lineHeight: "1.6",
    fontSize: "14px",
    color: "#9ca3af",
  },

  bulletText: {
    margin: "1px",
    lineHeight: "1.6",
    fontSize: "14.5px",
    whiteSpace: "pre-wrap",
    fontWeight: 400,
    color: "#374151",
  },

  ul: {
    paddingLeft: "10px",
    margin: "0px",
  },

  li: {
    listStyle: "none",
  },

  messageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    marginTop: "14px",
  },

  card: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px",
  },

  cardTitle: {
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "8px",
    color: "#065f46",
  },

  cardText: {
    fontSize: "14px",
    lineHeight: "1.7",
    color: "#374151",
    marginBottom: "10px",
  },

  lead: {
    fontSize: "14px",
    lineHeight: "1.75",
    color: "#111827",
    fontWeight: 500,
    marginBottom: "8px",
  },

  toggle: {
    fontSize: "12px",
    color: "#6b7280",
    background: "none",
    border: "none",
    padding: "0px",
    cursor: "pointer",
    textDecoration: "underline",
    marginBottom: "16px",
  },

  judgementIntro: {
    paddingLeft: "12px",
    borderLeft: "2px solid #10b981",
    marginBottom: "16px",
  },

  // ⚠️ 원본 코드에 오타 있었음: marginbottom → marginBottom
  sectionDivider: {
    height: "1px",
    backgroundColor: "#e5e7eb",
    marginBottom: "16px",
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
    overflowY: "auto",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  issueButton: {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    fontSize: "13.5px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
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
    overflowY: "auto",
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
    lineHeight: "1.8",
    marginBottom: "10px",
    color: "#374151",
    whiteSpace: "pre-wrap",
  },

  caseNumber: {
    fontSize: "13.5px",
    fontWeight: 600,
    color: "#047857",
    marginBottom: "8px",
    letterSpacing: "0.02em",
  },
};

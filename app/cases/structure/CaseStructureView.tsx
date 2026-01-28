// app/cases/structure/CaseStructureView.tsx

"use client";

import { useState } from "react";
import { SummaryBox } from "./SummaryBox";
import { IssueList } from "./IssueList";
import { IssueDetail } from "./IssueDetail";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getCaseAccess } from "../access";

type IssueVM = {
  title: string;
  plaintiff: string[];
  defendant: string[];
  court: string[];
};

type Props = {
  vm: {
    meta: {
      caseNumber: string;
    };
    summary: {
      oneLiner?: string;
      legalDirection?: string;
      practicalImplication?: string;
    };
    issues: IssueVM[];
  };
  onOpenMenu: () => void;
};

export function CaseStructureView({ vm, onOpenMenu }: Props) {

  const { userId } = useAuth();
  const saveThought = useSaveThought();
  
  const userAccess = useUserAccessLevel();
  const caseAccess = getCaseAccess(userAccess, "B");

  const [selectedIssue, setSelectedIssue] = useState<string>(
    vm.issues[0]?.title ?? ""
  );

  const [summaryTab, setSummaryTab] = useState<
    "one_liner" | "legal_direction" | "practical_implication"
  >("one_liner");

  const current =
    vm.issues.find((i: any) => i.title === selectedIssue) ?? null;

  const handleSaveCurrent = () => {
    if (!userId || !selectedIssue) return;

    saveThought({
      targetType: "case",
      targetId: `${vm.meta.caseNumber}::${selectedIssue}`,
      parentType: "case",
      parentId: vm.meta.caseNumber,
    });



  };
  return (
    <main style={styles.container}>
      <div style={styles.pageFrame}>
        <SummaryBox
          caseNumber={vm.meta.caseNumber}
          summary={vm.summary}
          tab={summaryTab}
          onChangeTab={setSummaryTab}
        />

        <div style={styles.layout}>
          <IssueList
            issues={vm.issues.map((i: any) => i.title)}
            selected={selectedIssue}
            onSelect={setSelectedIssue}
          />

          <IssueDetail issue={current}
                access={caseAccess} 
                onSave={handleSaveCurrent}
           />
        </div>

        <button style={styles.backButton} onClick={onOpenMenu}>
          ← 메뉴로 돌아가기
        </button>
      </div>
    </main>
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

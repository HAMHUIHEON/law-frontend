// law-frontend/app/cases/practice/CasePracticeView.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { PracticeVM } from "./adapters";
import { LogicBlock } from "./components/LogicBlock";
import { MessageCard } from "./components/MessageCard";
import { styles } from "./styles";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useAuth } from "@clerk/nextjs";



function splitKoreanSentences(text: string): string[] {
  if (!text) return [];
  return text
    .split(/(?<=다\.)|(?<=함\.)|(?<=임\.)|(?<=였다\.)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function CasePracticeView({
  vm,
  onOpenMenu,
  onIssueChange, // ✅ 추가
  initialIssue, // ✅ props로 받음
}: {
  vm: PracticeVM;
  onOpenMenu: () => void;
  onIssueChange?: (issue: string | null) => void;
  initialIssue?: string | null;
}) {
  const { userId } = useAuth();
  const saveThought = useSaveThought();
  const [openLogic, setOpenLogic] = useState(false);

 // ✅ 여기서 undefined 제거 + 우선순위 적용
  const initialSelected = initialIssue ?? vm.chains[0]?.issue ?? null;
  const [selectedIssue, setSelectedIssue] = useState<string | null>(() => {
    if (initialIssue !== undefined) return initialIssue;
    if (vm.chains.length > 0) return vm.chains[0].issue;
    return null;
  });

  useEffect(() => {
  if (!initialIssue) return;
  setSelectedIssue(initialIssue);
  }, [initialIssue]);

const handleSaveCurrent = () => {

  if (!userId) {
    return;
  }
  if (!selectedIssue) {
    return;
  }

  saveThought({
    targetType: "case",
    targetId: `${vm.meta.caseNumber}::${selectedIssue}`,
    parentType: "case",
    parentId: vm.meta.caseNumber,
  });
};


  const currentChain = useMemo(() => {
    if (!selectedIssue) return null;
    return vm.chains.find((c) => c.issue === selectedIssue) ?? null;
  }, [vm.chains, selectedIssue]);

  return (
    <main style={styles.container}>

      <div style={styles.pageFrame}>
        {/* ================= Executive Summary ================= */}
        <section style={styles.summaryBox}>
          <p style={styles.caseNumber}>{vm.meta.caseNumber}</p>
          <h1 style={styles.title}>{vm.summary.oneLiner}</h1>

          {/* 핵심 쟁점 */}
          <section style={styles.section}>
            <div style={styles.judgementIntro}>
              <p style={styles.sectionTitle}>이 사건의 핵심 쟁점</p>
              <div style={styles.sectionDivider} />
            </div>

            <ul style={styles.ul}>
              {vm.summary.coreIssues.map((item, idx) => (
                <li key={idx} style={styles.li}>
                  <p style={styles.paragraph}>
                    <span style={{ fontWeight: 400, marginRight: 6 }}>
                      {idx + 1}.
                    </span>
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* 법원이 본 관점 */}
          <section style={styles.section}>
            <div style={styles.judgementIntro}>
              <p style={styles.sectionTitle}>법원이 내린 주요 판단</p>
              <div style={styles.sectionDivider} />
            </div>

            <div>
              <ul style={styles.ul}>
                {splitKoreanSentences(vm.summary.judicialHow).map((p, i) => (
                  <p key={i} style={styles.paragraph}>
                    {p}
                  </p>
                ))}
              </ul>
            </div>

            <ul style={styles.ul}>
              <button style={styles.toggle} onClick={() => setOpenLogic((v) => !v)}>
                {openLogic ? "적용된 법리 접기" : "적용된 법리 보기"}
              </button>
            </ul>

            {openLogic && (
              <>
                <p style={styles.subTitle}>적용된 법리와 판단 기준</p>
                <ul style={styles.ul}>
                  {vm.summary.legalContext.map((ctx, i) => (
                    <li key={i} style={styles.li}>
                      <div style={styles.bulletRow}>
                        <span style={styles.bullet}>•</span>
                        <p style={styles.bulletText}>{ctx}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* 실무 메시지 */}
          <section style={styles.section}>
            <div style={styles.judgementIntro}>
              <p style={styles.sectionTitle}>이 판결이 주는 메시지</p>
              <div style={styles.sectionDivider} />
            </div>

            <div style={styles.messageGrid}>
              <MessageCard title="납세자에게" text={vm.summary.riskView.taxpayer} />
              <MessageCard title="과세관청에게" text={vm.summary.riskView.authority} />
              <MessageCard title="이 판례가 남긴 기준" text={vm.summary.riskView.precedent} />
            </div>
          </section>
        </section>

        {/* ================= Proof Area ================= */}
        <section style={styles.chainSection}>
          <h2 style={styles.chainTitle}>쟁점별 논증 구조</h2>

          <div style={styles.layout}>
            {/* LEFT */}
            <aside className="ui-scroll" style={styles.issueList}>
              {vm.chains.map((chain) => (
                <button
                  key={chain.issue}
                  style={{
                    ...styles.issueButton,
                    ...(chain.issue === selectedIssue ? styles.issueActive : {}),
                  }}
                  onClick={() => {
                    setSelectedIssue(chain.issue);
                    onIssueChange?.(chain.issue); // ✅ 핵심
                  }}
                >                  
                {chain.issue}
                </button>
              ))}
            </aside>

            {/* RIGHT */}
            <section className="ui-scroll" style={styles.issueDetail}>
              {currentChain && (
                <>
                  {/* 🔹 카드 헤더 */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap:12,
                      marginBottom: 10,
                    }}
                  >
                    <h3 style={styles.issueTitle}>{currentChain.issue}</h3>

                  <button
                  
                    onClick={handleSaveCurrent}
                    style={{
                      flexShrink: 0,   
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


                  </div>

                  <LogicBlock label="🧩 사실 관계" text={currentChain.premise} />
                  <LogicBlock label="📂 증거 및 경과" text={currentChain.evidence} />
                  <LogicBlock label="📜 관련 법령" text={currentChain.rule} />
                  <LogicBlock label="⚙️ 법리 적용" text={currentChain.application} />
                  <LogicBlock label="🧠 추론" text={currentChain.inference} />
                  <LogicBlock label="✅ 소결" text={currentChain.miniConclusion} />
                </>
              )}
            </section>
          </div>
        </section>

        <button style={styles.backButton} onClick={onOpenMenu}>
          ← 메뉴로 돌아가기
        </button>
      </div>
    </main>
  );
}

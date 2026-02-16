//29_FINAL/law-frontend/app/strategy/E_STEP2B/views/ChapterStep2bView.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSaveThought } from "@/app/hooks/useSaveThought";
import { useRecordStrategyTrace } from "@/app/hooks/useRecordStrategyTrace";
import { useUserAccessLevel } from "@/app/hooks/useUserAccessLevel";
import { getStrategyAccess } from "../../access";
import {
  Step2bChapterAnalysis,
  Step2bChapter1,
  Step2bChapter2,
  Step2bChapter3,
} from "../types";

import React from "react";

type Props = {
  bookId: string;
  chapter: "chapter1" | "chapter2" | "chapter3";
  data: Step2bChapterAnalysis;
};

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  bgSoft: "#fafafa",
};

export default function ChapterStep2bView({
  bookId,
  chapter,
  data,
}: Props) {
  const { userId } = useAuth();
  const userAccess = useUserAccessLevel();

  if (!userAccess) {
    return null;
  }

  const access = getStrategyAccess(userAccess, "E_STEP2B");
  const isLocked = access !== "FULL";

  const saveThought = useSaveThought();
  const [saving, setSaving] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useRecordStrategyTrace({
    userId,
    parentType: "strategy",
    parentId: bookId,
    traceType: "reasoning",
    traceId: `E_STEP2B:${chapter}`,
  });

  if (isLocked) {
    return <CenterMessage>접근 권한이 필요합니다.</CenterMessage>;
  }
  let content: React.ReactNode = null;

  if (chapter === "chapter1") {
    content = renderChapter1(
      data as Step2bChapter1,
      openSections,
      setOpenSections
    );
  }

  if (chapter === "chapter2") {
    content = renderChapter2(
      data as Step2bChapter2,
      openSections,
      setOpenSections
    );
  }

  if (chapter === "chapter3") {
    content = renderChapter3(
      data as Step2bChapter3,
      openSections,
      setOpenSections
    );
  }
  return (
    <article style={styles.container}>
      {/* Floating Save */}
      <div style={styles.floatingWrap}>
        <button
          onClick={async () => {
            if (!userId || saving) return;
            setSaving(true);
            try {
              await saveThought({
                parentType: "strategy",
                parentId: bookId,
                targetType: "reasoning",
                targetId: `E_STEP2B:${chapter}`,
              });
            } finally {
              setSaving(false);
            }
          }}
          style={styles.floatingButton}
              onMouseEnter={(e) => {
              setShowHint(true);
              e.currentTarget.style.background = "#fffbeb";
              e.currentTarget.style.borderColor = "#f59e0b";
              e.currentTarget.style.transform = "scale(1.06)";
              e.currentTarget.style.boxShadow =
                "0 6px 14px rgba(245,158,11,0.25)";
            }}
            onMouseLeave={(e) => {
              setShowHint(false);
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 10px rgba(0,0,0,0.08)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.96)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1.06)";
            }}
        >
          🔖
        </button>
      </div>

      <h1 style={styles.title}>
        {data.chapter} 종합 구조 분석
      </h1>

      <StrategyNotice />

      {/* 아래부터 기존 L0/L2/L3 그대로 */}

     {content}  {/* ✅ 이거 추가 */}

    </article>
  );
}

/* ================= Components ================= */
function renderWithPreview<T>(
  sectionKey: string,
  items: T[] | undefined,   // 👈 undefined 허용
  renderItem: (item: T, idx: number) => React.ReactNode,
  previewCount = 2,
  openSections: Record<string, boolean>,
  setOpenSections: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
) {
  if (!Array.isArray(items)) {
    return null; // 👈 여기 추가
  }

  const isOpen = openSections[sectionKey] ?? false;
  const visibleItems = isOpen ? items : items.slice(0, previewCount);

  return (
    <>
      {visibleItems.map(renderItem)}

      {items.length > previewCount && (
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={() =>
              setOpenSections((prev) => ({
                ...prev,
                [sectionKey]: !isOpen,
              }))
            }
            style={styles.toggleButton}
          >
            {isOpen
              ? "접기 ▲"
              : `더 보기 (${items.length - previewCount}) ▼`}
          </button>
        </div>
      )}
    </>
  );
}

  function renderChapter1(
    data: Step2bChapter1,
    openSections: Record<string, boolean>,
    setOpenSections: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >
  ) {
  return (
    <>
      {/* ================= L0 ================= */}
    <LayerSection label="L0" title="상위 규범 의존 구조">
      {renderWithPreview(
        "chapter1-L0", // 👉 섹션 고유 키
        data.normative_dependency_map,
        (item, idx) => (
          <ReportCard key={idx}>
            <CardTitle>{item.external_article}</CardTitle>

            <Item label="실체 구조" labelStyle={styles.labelFunction}>
              {item.substantive_structure}
            </Item>

            <Item label="의존 유형" labelStyle={styles.labelDependency}>
              {item.dependency_type}
            </Item>

            <Item label="해석 한계" labelStyle={styles.labelLimit}>
              {item.interpretation_limit}
            </Item>

            <TagRow
              label="연결 내부 메커니즘"
              items={item.linked_internal_mechanisms.map(
                (m) => `${m.section} (${m.layer}-${m.category})`
              )}
              labelStyle={styles.labelEvidence}
            />
          </ReportCard>
        ),
        2,                // 👉 2개만 미리보기
        openSections,
        setOpenSections
      )}
    </LayerSection>


      <Divider />

      {/* ================= L2 ================= */}
      <LayerSection label="L2" title="실체적 판단 임계 구조">
        {renderWithPreview(
          "chapter1-L2",
          data.substantive_threshold_analysis,
          (item, idx) => (
            <ReportCard key={item.external_article ?? idx}>
              <CardTitle>{item.external_article}</CardTitle>

              <Item label="임계 유형" labelStyle={styles.labelFunction}>
                {item.threshold_type}
              </Item>

              <TagRow
                label="내부 트리거"
                items={item.internal_trigger_point.map(
                  (m) => `${m.section} (${m.category})`
                )}
                labelStyle={styles.labelEvidence}
              />

              <Item label="에스컬레이션 경로" labelStyle={styles.labelDependency}>
                {item.escalation_path}
              </Item>

              <Collapsible title="리스크 메모" content={item.risk_note} />
            </ReportCard>
          ),
          2,
          openSections,
          setOpenSections
        )}
      </LayerSection>


      <Divider />

      {/* ================= L3 ================= */}
      <LayerSection label="L3" title="리스크 에스컬레이션 맵">
        {renderWithPreview(
          "chapter1-L3",
          data.risk_escalation_map,
          (item, idx) => (
            <ReportCard key={idx}>
              <CardTitle>{item.stage}</CardTitle>

              <TagRow
                label="외부 규범"
                items={item.external_norm}
                labelStyle={styles.labelEvidence}
              />

              <TagRow
                label="내부 통제 지점"
                items={item.internal_control.map(
                  (m) => `${m.section} (${m.layer})`
                )}
                labelStyle={styles.labelEvidence}
              />

              <Item label="에스컬레이션 조건" labelStyle={styles.labelFunction}>
                {item.escalation_condition}
              </Item>

              <Item label="시스템 리스크" labelStyle={styles.labelLimit}>
                {item.systemic_risk}
              </Item>

              <Item label="긴장 유형" labelStyle={styles.labelDependency}>
                {item.tension_type}
              </Item>
            </ReportCard>
          ),
          2,
          openSections,
          setOpenSections
        )}
      </LayerSection>
      </>
      );
}
  function renderChapter2(
    data: Step2bChapter2,
    openSections: Record<string, boolean>,
    setOpenSections: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >
  ) {
  return (
    <>
    <LayerSection label="L0" title="상위 규범 의존 구조">
      {renderWithPreview(
        "chapter2-L0",
        data.normative_dependency_map,
        (item, idx) => (
          <ReportCard key={idx}>
            <CardTitle>{item.external_norm}</CardTitle>

            <Item label="규범 기능" labelStyle={styles.labelFunction}>
              {item.normative_function}
            </Item>

            <Item label="의존 진술" labelStyle={styles.labelDependency}>
              {item.dependency_statement}
            </Item>

            <Item label="해석 한계" labelStyle={styles.labelLimit}>
              {item.interpretation_limit}
            </Item>

            <TagRow
              label="연결 내부 메커니즘"
              items={item.linked_internal_mechanisms.map(
                (m) => `${m.section} (${m.layer}-${m.category})`
              )}
              labelStyle={styles.labelEvidence}
            />
          </ReportCard>
        ),
        2,
        openSections,
        setOpenSections
      )}
    </LayerSection>

      <Divider />

      {/* L1(혹은 L2 성격) - 절차 임계 */}
    <LayerSection label="L2" title="절차적 임계 구조">
      {renderWithPreview(
        "chapter2-L2",
        data.procedural_threshold_analysis,
        (item, idx) => (
          <ReportCard key={idx}>
            <CardTitle>{item.threshold_name}</CardTitle>

            <TagRow
              label="외부 트리거 규범"
              items={item.external_trigger_norms}
              labelStyle={styles.labelEvidence}
            />

            <TagRow
              label="내부 트리거 포인트"
              items={item.internal_trigger_points.map(
                (m) => `${m.section} (${m.layer}-${m.category})`
              )}
              labelStyle={styles.labelEvidence}
            />

            <Item label="임계 로직" labelStyle={styles.labelFunction}>
              {item.threshold_logic}
            </Item>

            <Collapsible title="리스크 메모" content={item.risk_note} />
          </ReportCard>
        ),
        2,
        openSections,
        setOpenSections
      )}
    </LayerSection>

      <Divider />

      {/* 변환 통제 */}
    <LayerSection label="L3" title="변환 통제 맵">
      {renderWithPreview(
        "chapter2-L3A",
        data.conversion_control_map,
        (item, idx) => (
          <ReportCard key={idx}>
            <CardTitle>{item.conversion_type}</CardTitle>

            <TagRow
              label="외부 제약"
              items={item.external_constraints}
              labelStyle={styles.labelEvidence}
            />

            <TagRow
              label="내부 의사결정 노드"
              items={item.internal_decision_nodes.map(
                (m) => `${m.section} (${m.layer}-${m.category})`
              )}
              labelStyle={styles.labelEvidence}
            />

            <Item label="결정 주체" labelStyle={styles.labelDependency}>
              {item.decision_body}
            </Item>

            <Item label="고지/통지 연결" labelStyle={styles.labelFunction}>
              {item.notice_link}
            </Item>

            <Item label="해석 한계" labelStyle={styles.labelLimit}>
              {item.interpretation_limit}
            </Item>
          </ReportCard>
        ),
        2,
        openSections,
        setOpenSections
      )}
    </LayerSection>

      <Divider />

      {/* 통제-결과 연결 */}
    <LayerSection label="L3" title="통제-결과 연결 구조">
      {renderWithPreview(
        "chapter2-L3B",
        data.control_consequence_link,
        (item, idx) => (
          <ReportCard key={idx}>
            <CardTitle>{item.control_issue}</CardTitle>

            <TagRow
              label="외부 시스템"
              items={item.external_system}
              labelStyle={styles.labelEvidence}
            />

            <TagRow
              label="내부 통제"
              items={item.internal_controls.map(
                (m) => `${m.section} (${m.layer}-${m.category})`
              )}
              labelStyle={styles.labelEvidence}
            />

            <Item label="결과 경로" labelStyle={styles.labelDependency}>
              {item.consequence_path}
            </Item>

            <Item label="긴장 메모" labelStyle={styles.labelLimit}>
              {item.tension_note}
            </Item>
          </ReportCard>
        ),
        2,
        openSections,
        setOpenSections
      )}
    </LayerSection>
    </>
  );
}

function renderChapter3(
  data: Step2bChapter3,
  openSections: Record<string, boolean>,
  setOpenSections: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
) {
  return (
    <>
      {/* L0 */}
      <LayerSection label="L0" title="상위 규범 의존 구조">
        {renderWithPreview(
          "chapter3-L0",
          data.normative_dependency_map,
          (item, idx) => (
            <ReportCard key={idx}>
              <CardTitle>{item.external_article}</CardTitle>

              <Item label="실체 구조" labelStyle={styles.labelFunction}>
                {item.substantive_structure}
              </Item>

              <Item label="의존 유형" labelStyle={styles.labelDependency}>
                {item.dependency_type}
              </Item>

              <Item label="해석 한계" labelStyle={styles.labelLimit}>
                {item.interpretation_limit}
              </Item>

              <TagRow
                label="연결 내부 메커니즘"
                items={item.linked_internal_mechanisms.map(
                  (m) => `${m.section} (${m.layer}-${m.category})`
                )}
                labelStyle={styles.labelEvidence}
              />
            </ReportCard>
          ),
          2,
          openSections,
          setOpenSections
        )}
      </LayerSection>

      <Divider />

      {/* L2 */}
      <LayerSection label="L2" title="실체적 판단 임계 구조">
        {renderWithPreview(
          "chapter3-L2",
          data.substantive_threshold_analysis,
          (item, idx) => (
            <ReportCard key={idx}>
              <CardTitle>{item.external_article}</CardTitle>

              <Item label="임계 유형" labelStyle={styles.labelFunction}>
                {item.threshold_type}
              </Item>

              <TagRow
                label="내부 트리거"
                items={item.internal_trigger_point.map(
                  (m) => `${m.section} (${m.layer}-${m.category})`
                )}
                labelStyle={styles.labelEvidence}
              />

              <Item label="에스컬레이션 경로" labelStyle={styles.labelDependency}>
                {item.escalation_path}
              </Item>

              <Collapsible title="리스크 메모" content={item.risk_note} />
            </ReportCard>
          ),
          2,
          openSections,
          setOpenSections
        )}
      </LayerSection>

      <Divider />

      {/* 변환-실체 연결 */}
      <LayerSection label="L3" title="변환-실체 연결 구조">
        {renderWithPreview(
          "chapter3-L3A",
          data.conversion_substance_link,
          (item, idx) => (
            <ReportCard key={idx}>
              <CardTitle>{item.conversion_type}</CardTitle>

              <TagRow
                label="외부 근거"
                items={item.external_basis}
                labelStyle={styles.labelEvidence}
              />

              <TagRow
                label="내부 의사결정 노드"
                items={item.internal_decision_node.map(
                  (m) => `${m.section} (${m.layer}-${m.category})`
                )}
                labelStyle={styles.labelEvidence}
              />

              <Item label="결정 의존" labelStyle={styles.labelDependency}>
                {item.decision_dependency}
              </Item>

              <Item label="해석 한계" labelStyle={styles.labelLimit}>
                {item.interpretation_limit}
              </Item>
            </ReportCard>
          ),
          2,
          openSections,
          setOpenSections
        )}
      </LayerSection>

      <Divider />

      {/* 리스크 */}
      <LayerSection label="L3" title="리스크 에스컬레이션 맵">
        {renderWithPreview(
          "chapter3-L3B",
          data.risk_escalation_map,
          (item, idx) => (
            <ReportCard key={idx}>
              <CardTitle>{item.stage}</CardTitle>

              <TagRow
                label="외부 규범"
                items={item.external_norm}
                labelStyle={styles.labelEvidence}
              />

              <TagRow
                label="내부 통제 지점"
                items={item.internal_control.map(
                  (m) => `${m.section} (${m.layer}-${m.category})`
                )}
                labelStyle={styles.labelEvidence}
              />

              <Item label="에스컬레이션 조건" labelStyle={styles.labelFunction}>
                {item.escalation_condition}
              </Item>

              <Item label="시스템 리스크" labelStyle={styles.labelLimit}>
                {item.systemic_risk}
              </Item>

              <Item label="긴장 유형" labelStyle={styles.labelDependency}>
                {item.tension_type}
              </Item>
            </ReportCard>
          ),
          2,
          openSections,
          setOpenSections
        )}
      </LayerSection>
    </>
  );
}

function LayerSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={styles.layerTitleWrapper}>
        <div style={styles.layerTitleBar} />
        <h2 style={styles.layerTitle}>
          {label}. {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Divider() {
  return <hr style={{ borderColor: colors.line, marginBottom: 24 }} />;
}

function ReportCard({ children }: { children: React.ReactNode }) {
  return <div style={styles.card}>{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.cardTitleWrapper}>
      <div style={styles.cardTitleBar} />
      <h3 style={styles.cardTitle}>{children}</h3>
    </div>
  );
}

function Item({
  label,
  children,
  labelStyle,
}: {
  label: string;
  children: React.ReactNode;
  labelStyle?: React.CSSProperties;
}) {
  return (
    <p style={styles.item}>
      <span style={labelStyle ?? styles.labelBase}>{label}</span>
      {children}
    </p>
  );
}

function TagRow({
  label,
  items,
  labelStyle,
}: {
  label: string;
  items?: string[];
  labelStyle?: React.CSSProperties;
}) {
  if (!items?.length) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <span style={labelStyle ?? styles.labelBase}>{label}</span>
      <div>
        {items.map((t, i) => (
          <span key={i} style={styles.tag}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Collapsible({
  title,
  content,
}: {
  title: string;
  content?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!content) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={styles.toggleButton}
      >
        {open ? "접기 ▲" : `${title} ▼`}
      </button>

      {open && (
        <div style={styles.failureBox}>{content}</div>
      )}
    </div>
  );
}

function StrategyNotice() {
  return (
    <div style={styles.noticeBox}>
      <p style={styles.noticeText}>
        📌 본 페이지의 내용은 법령 및 공개 자료를 기반으로 AI가
        구조적으로 재구성한 분석 자료입니다.
      </p>
      <p style={styles.noticeText}>
        실제 사건에 대한 법적 판단이 아니라,
        연구 및 전략 시뮬레이션 목적의 가상 분석입니다.
      </p>
      <p style={styles.noticeText}>
        구체적 사안에 대한 판단은 반드시 전문가 자문을 통해 확인하시기 바랍니다.
      </p>
    </div>
  );
}
function CenterMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 80, textAlign: "center" }}>
      {children}
    </div>
  );
}


/* ================= Styles ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 960,
    margin: "0 auto",
    paddingTop: 24,
    lineHeight: 1.7,
    color: colors.ink,
  },

  title: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 32,
  },

  layerTitleWrapper: {
    display: "flex",
    alignItems: "center",
    marginBottom: 18,
  },

  layerTitleBar: {
    width: 4,
    height: 18,
    background: "#1e3a8a",
    borderRadius: 2,
    marginRight: 10,
  },

  layerTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
  },

  card: {
    border: `1px solid ${colors.line}`,
    borderRadius: 12,
    padding: "20px 22px",
    marginBottom: 24,
    background: "#ffffff",
  },

  cardTitleWrapper: {
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  },

  cardTitleBar: {
    width: 4,
    height: 18,
    background: "#1e3a8a",
    borderRadius: 2,
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
  },

  item: {
    fontSize: 14,
    marginBottom: 8,
  },

  tag: {
    display: "inline-block",
    fontSize: 12,
    background: "#f3f4f6",
    padding: "4px 8px",
    borderRadius: 8,
    marginRight: 6,
    marginTop: 6,
  },

  failureBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 8,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    fontSize: 13,
  },

  toggleButton: {
    fontSize: 12,
    color: colors.muted,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },

  labelBase: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
  },

  labelFunction: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
    color: "#1e3a8a",
  },

  labelDependency: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
    color: "#0f766e",
  },

  labelEvidence: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
    color: "#7c3aed",
  },

  labelLimit: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    marginRight: 6,
    color: "#b45309",
  },
  floatingWrap: {
  position: "fixed",
  right: 24,
  bottom: 160,
  zIndex: 60,
},

floatingButton: {
  width: 44,
  height: 44,
  borderRadius: 999,
  border: `1px solid ${colors.line}`,
  background: "#fff",
  fontSize: 20,
  cursor: "pointer",
},

noticeBox: {
  border: `1px solid ${colors.line}`,
  background: colors.bgSoft,
  borderRadius: 12,
  padding: "16px 18px",
  marginBottom: 36,
},

noticeText: {
  fontSize: 12.5,
  lineHeight: 1.6,
  color: colors.muted,
  marginBottom: 6,
},

};

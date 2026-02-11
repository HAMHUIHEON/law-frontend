//E_STEP1/views/ChapterOneStep1View.tsx
"use client";

import { ChapterOneStep1ViewModel } from "../types";

type Props = {
  data: ChapterOneStep1ViewModel;
};

export function ChapterOneStep1View({ data }: Props) {
  return (
    <div style={styles.container}>
      
      {/* =========================
          SUMMARY
      ========================= */}
      <Section title="📘 제1장 개관">
        <p style={styles.summary}>{data.summary}</p>
      </Section>

      {/* =========================
          PRINCIPLE AXIS
      ========================= */}
      <Section title="⚖ 기본 원칙 축">
        {data.principles.map((p, idx) => (
          <Card key={idx}>
            <h3>{p.title}</h3>
            <ArticleList articles={p.articles} />
            <p>{p.meaning}</p>
            <EvidenceBadge status={p.evidenceStatus} />
          </Card>
        ))}
      </Section>

      {/* =========================
          AUTHORITY AXIS
      ========================= */}
      <Section title="🏛 권한·통제 구조">
        {data.authorities.map((a, idx) => (
          <Card key={idx}>
            <h3>{a.topic}</h3>
            <ArticleList articles={a.articles} />
            <p>{a.controlFunction}</p>
            <EvidenceBadge status={a.evidenceStatus} />
          </Card>
        ))}
      </Section>

      {/* =========================
          PROCEDURE AXIS
      ========================= */}
      <Section title="🔁 절차 단계 구조">
        {data.procedureStages.map((s, idx) => (
          <Card key={idx}>
            <h3>{s.stage}</h3>
            <ArticleList articles={s.articles} />
            <p>{s.keyControls}</p>
            <EvidenceBadge status={s.evidenceStatus} />
          </Card>
        ))}
      </Section>

      {/* =========================
          DEFINITION TABLE
      ========================= */}
      <Section title="📊 조사 유형 비교">
        <table style={styles.table}>
          <thead>
            <tr>
              {data.definitionTable.columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.definitionTable.rows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.category}</td>
                <td>{row.definition}</td>
                <td>{row.authority}</td>
                <td>{row.noticeRequirement}</td>
                <td>
                  {row.notes}
                  <EvidenceBadge status={row.evidenceStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* =========================
          DEFENSE POINTS
      ========================= */}
      <Section title="🛡 방어 포인트">
        {data.defensePoints.map((d, idx) => (
          <Card key={idx}>
            <h3>{d.scenario}</h3>
            <ArticleList articles={d.articles} />
            <p><strong>요건:</strong> {d.legalRequirement}</p>
            <p>{d.commentary}</p>
            <EvidenceBadge status={d.evidenceStatus} />
          </Card>
        ))}
      </Section>

      {/* =========================
          INTERNAL OPS
      ========================= */}
      <Section title="⚙ 내부 운영 포인트">
        {data.internalOperations.map((i, idx) => (
          <Card key={idx}>
            <h3>{i.area}</h3>
            <ArticleList articles={i.articles} />
            <p>{i.implication}</p>
            <EvidenceBadge status={i.evidenceStatus} />
          </Card>
        ))}
      </Section>

      {/* =========================
          BRIDGE
      ========================= */}
      <Section title="🔎 다음 장으로 이어지는 질문">
        {data.bridgeQuestions.map((b, idx) => (
          <Card key={idx}>
            <h3>{b.question}</h3>
            <p>→ {b.nextChapter}</p>
            <p>{b.why}</p>
          </Card>
        ))}
      </Section>

      {/* =========================
          EXTRA
      ========================= */}
      {data.extraExplanations.length > 0 && (
        <Section title="📌 추가 설명">
          {data.extraExplanations.map((e, idx) => (
            <Card key={idx}>
              <h3>{e.topic}</h3>
              <p>{e.reasonSeparated}</p>
              <p>{e.notes}</p>
            </Card>
          ))}
        </Section>
      )}
    </div>
  );
}
function Section({ title, children }: any) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Card({ children }: any) {
  return (
    <div style={styles.card}>
      {children}
    </div>
  );
}

function ArticleList({ articles }: { articles: string[] }) {
  return (
    <div style={styles.articleList}>
      {articles.join(", ")}
    </div>
  );
}

function EvidenceBadge({ status }: { status: "근거 있음" | "근거 부족" }) {
  return (
    <span
      style={{
        ...styles.badge,
        background:
          status === "근거 있음" ? "#e5f7e5" : "#fde8e8",
        color:
          status === "근거 있음" ? "#065f46" : "#991b1b",
      }}
    >
      {status}
    </span>
  );
}
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 24,
  },
  summary: {
    fontSize: 15,
    lineHeight: 1.8,
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    background: "#fff",
  },
  articleList: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  badge: {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 11,
    marginTop: 8,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
};

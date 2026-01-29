// law-frontend/app/me/page.tsx
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";
import { MyPageVM, ThoughtTrace } from "@/types/me";
import Link from "next/link";
import { SavedThoughtItem } from "./SavedThoughtItem";

export const dynamic = "force-dynamic";

const mockData: MyPageVM = {
  accessLevel: "GUEST", // ✅ 추가
  recent: [],
  traces: [],          // ✅ 추가
  saved: [],
  documents: [],
};

async function getMyPageVM(): Promise<MyPageVM> {
  const { userId } = await auth();

  if (!userId) {
    return mockData;
  }

  const { data: accessRow } = await supabaseAdmin
    .from("user_access_levels")
    .select("access_level")
    .eq("user_id", userId)
    .single();

  const accessLevel = accessRow?.access_level ?? "MEMBER";

 // ✅ 기존 recent_thoughts 유지
  const { data, error } = await supabaseAdmin
    .from("recent_thoughts")
    .select(`
      id,
      target_type,
      target_id,
      last_viewed_at
      
    `)
    .eq("user_id", userId)
    .order("last_viewed_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("[MyPage:getMyPageVM]", error);
    return mockData;
  }
 // ✅ thought_traces 추가 노출
  const { data: traceRows, error: traceErr } = await supabaseAdmin
  .from("thought_traces")
  .select(`
    id,
    parent_type,
    parent_id,
    trace_type,
    trace_id,
    viewed_at
  `)
  .eq("user_id", userId)
  .order("viewed_at", { ascending: false })
  .limit(8);


const { data: savedRows } = await supabaseAdmin
  .from("saved_thoughts")
  .select(`
    id,
    target_type,
    target_id,
    parent_type,
    parent_id,
    saved_at
  `)
  .eq("user_id", userId)
  .order("saved_at", { ascending: false })
  .limit(5);



if (traceErr) {
  console.error("[MyPage:traces]", traceErr);
}

  const traces: ThoughtTrace[] = (traceRows ?? []).map((row: any) => ({
    id: row.id,
    parentType: row.parent_type,
    parentId: row.parent_id,
    traceType: row.trace_type,
    traceId: row.trace_id,
    viewedAt: row.viewed_at ?? "",
    title: buildTraceTitle(row),
  }));

  return {
    ...mockData,
    accessLevel,
    recent: (data ?? []).map((row: any) => ({
      id: row.id,
      title: buildRecentTitle(row),
      targetType: row.target_type,
      targetId: row.target_id,
      lastVisitedAt: row.last_viewed_at ?? "",
    })),

    traces, // ✅ 여기서만 추가
    saved: (savedRows ?? []).map((row: any) => ({
      id: row.id,
      title: buildSavedTitle(row),
      targetType: row.target_type,
      targetId: row.target_id,

      parentType: row.parent_type,
      parentId: row.parent_id,

      savedAt: row.saved_at ?? "",
    })),
  }
}

function buildRecentTitle(row: {
  target_type: string;
  target_id: string;
}) {
  switch (row.target_type) {
    case "case":
      return `사건 ${row.target_id}`;
    case "law":
      return `법령 ${row.target_id}`;
    case "strategy":
      return `전략 ${row.target_id}`;
    case "document":
      return `문서 ${row.target_id}`;
    case "block":
      return `블록 ${row.target_id}`;
    default:
      return "알 수 없는 사고";
  }
}

// ✅ traces 노출용 타이틀
function buildTraceTitle(row: {
  parent_type: string;
  parent_id: string;
  trace_type: string;
  trace_id: string;
}) {
  // 🔥 strategy 는 책 단위로 사람이 읽을 수 있게 표시
  const parent =
    row.parent_type === "strategy"
      ? `전략 ${row.parent_id}`
      : `${row.parent_type}:${row.parent_id}`;
      
  switch (row.trace_type) {
    case "article":
      return `(${parent}) 조문 조회 · ${row.trace_id}`;
    case "semantic":
      return `(${parent}) 해석 포인트 · ${row.trace_id}`;
    case "reasoning":
      return `(${parent}) 검토 단계 · ${row.trace_id}`;
    default:
      return `(${parent}) trace · ${row.trace_id}`;
  }
}

function buildSavedTitle(row: {
  parent_type: string;
  parent_id: string;
  target_type: string;
  target_id: string;
}) {
  const parent =
    row.parent_type === "strategy"
      ? `전략 ${row.parent_id}`
      : `${row.parent_type}:${row.parent_id}`;

  switch (row.target_type) {
    case "semantic":
      return `(${parent}) 해석 포인트 · ${row.target_id}`;
    case "reasoning":
      return `(${parent}) 검토 단계 · ${row.target_id}`;
    case "article":
      return `(${parent}) 조문 조회 · ${row.target_id}`;
    case "summary":
      return `(${parent}) 요약 · ${row.target_id}`;
    default:
      return `(${parent}) ${row.target_type} · ${row.target_id}`;
  }
}

export default async function MyPage() {
  const vm = await getMyPageVM();

  return (
    <main style={styles.container}>
      <section style={styles.section}>
      {/* 홈 버튼 */}
      <div style={styles.homeWrapper}>
        <Link href="/enter" style={styles.homeLink}>
          HOME
        </Link>
      </div>

        <h2 style={styles.sectionTitle}>최근 머문 사고</h2>
        {vm.recent.length === 0 ? (
          <p style={styles.empty}>아직 머문 사고가 없습니다.</p>
        ) : (
        vm.recent.map((item) => (
          <p key={item.id} style={styles.empty}>
            {item.title}
          </p>
        ))

        )}
      </section>
      {/* ✅ 여기부터 추가: thought_traces 노출 */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>최근 조회한 상세 경로</h2>
        {vm.traces.length === 0 ? (
          <p style={styles.empty}>아직 조회 기록이 없습니다.</p>
        ) : (
          vm.traces.map((t) => (
            <p key={t.id} style={styles.empty}>
              {t.title}
            </p>
          ))
        )}
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>다시 읽고 싶은 사고</h2>
        {vm.saved.length === 0 ? (
          <p style={styles.empty}>다시 읽고 싶은 사고를 저장해보세요.</p>
        ) : (
        vm.saved.map((item) => (
        <SavedThoughtItem
          key={item.id}
          title={item.title}
        />
        ))
        )}
        <p
        style={{
          marginTop: 12,
          fontSize: 12,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.6,
        }}
      >
        # 해당 기능은 현재 준비 중입니다.
      </p>
      </section>

      {/* <section style={styles.section}>
        <h2 style={styles.sectionTitle}>나의 서재</h2>
        {vm.documents.length === 0 ? (
          <p style={styles.empty}>나만의 문서를 만들어보세요.</p>
        ) : (
        vm.recent.map((item) => (
          <p key={item.id} style={styles.empty}>
            {item.title}
          </p>
        ))
        )}
      </section> */}
      
      <section style={styles.section}>
      <h2 style={styles.sectionTitle}>멤버십</h2>
      {vm.accessLevel === "SUBSCRIBER" ? (
        <>
          <p style={styles.empty}>
            현재 <strong>구독 멤버십</strong>을 이용 중입니다.
          </p>

          <Link
            href="/me/unsubscribe"
            style={{
              marginTop: 12,
              display: "inline-block",
              fontSize: 13,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.35)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            멤버십 해지
          </Link>
        </>
      ) : (
        <>
          <p style={styles.empty}>현재 무료 멤버십을 이용 중입니다.</p>
          <Link href="/me/subscribe" style={{ fontSize: 13, color: "#fff" }}>
            구독 멤버십 알아보기 →
          </Link>
        </>
      )}
    </section>

    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    padding: "96px 24px 140px",
  },
  homeWrapper: {
    marginBottom: "32px", // ← 여기서 간격 제어
    marginTop: "-16px",
  },

  homeLink: {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: "13px",
  color: "rgba(255,255,255,0.55)",
  cursor: "pointer",
  letterSpacing: "0.02em",

  },

  section: {
    maxWidth: "960px",
    margin: "0 auto 72px",
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: 500,
    marginBottom: "18px",
    color: "rgba(255,255,255,0.88)",
    letterSpacing: "-0.01em",
  },

  empty: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.6,
  },
};

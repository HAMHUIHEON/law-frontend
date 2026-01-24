//law-frontend/types/me.ts

export type ThoughtTargetType =
  | "case_flow"
  | "case_structure"
  | "case_practice"
  | "law"
  | "strategy"
  | "document"
  | "block";


export type RecentThought = {
  id: string;
  title: string;
  targetType: ThoughtTargetType;
  targetId: string;
  lastVisitedAt: string; // ISO
};

export type ThoughtTrace = {
  id: string;
  parentType: "case" | "law" | "strategy";
  parentId: string;
  traceType: "article" | "semantic" | "reasoning";
  traceId: string;
  viewedAt: string; // ISO
  title: string;    // ✅ 노출용 (강추)
};

export type SavedThought = {
  id: string;
  title: string;

  // 🔑 어디를 다시 갈지
  targetType: ThoughtTargetType;
  targetId: string;

  // 🔑 컨텍스트 (SSOT)
  parentType: "case" | "law" | "strategy";
  parentId: string;

  savedAt: string; // ISO
};


export type MyDocument = {
  id: string;
  title: string;
  role: "owner" | "editor" | "viewer";
  updatedAt: string; // ISO
};

export type MyPageVM = {
  recent: RecentThought[];
  saved: SavedThought[];
  traces: ThoughtTrace[];  // ✅ 반드시 필요
  documents: MyDocument[];
};

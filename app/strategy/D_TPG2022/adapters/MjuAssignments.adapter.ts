// law-frontend/app/strategy/JU/adapters/MjuAssignments.adapter.ts
// MJU 타입 + JU 블록 매핑 어댑터 (ContextUI용, 완결본)

export interface MjuAssignmentsApi {
  book_id: string;
  mju_types: {
    mju_type_id: string;
    mju_type_name: string;
  }[];
  assignments: MjuAssignmentApi[];
}

export interface MjuAssignmentApi {
  judgement_id: string;
  section_key: string;
  title: string;
  source_pages: {
    page_start: number;
    page_end: number;
  };
  core_question: string;
  mju_type_id: string;
  mju_type_name: string;
  assignment_reason: string;
  block_id: string;
}

/* ============================== */
/* Context / UI ViewModel         */
/* ============================== */

export interface MjuTypesVM {
  bookId: string;
  types: MjuTypeVM[];
}

export interface MjuTypeVM {
  mjuTypeId: string;
  mjuTypeName: string;
  blocks: MjuBlockRefVM[];
}

export interface MjuBlockRefVM {
  blockId: string;
  judgementId: string;
  title: string;
  coreQuestion: string;
  pageStart: number;
  pageEnd: number;
  sectionKey: string;
  assignmentReason: string;
}

/* ============================== */
/* Adapter                        */
/* ============================== */

export function adaptMjuAssignmentsFromApi(
  api: MjuAssignmentsApi
): MjuTypesVM {
  const typeMap: Record<string, MjuTypeVM> = {};

  // 1. MJU 타입 초기화
  for (const t of api.mju_types) {
    typeMap[t.mju_type_id] = {
      mjuTypeId: t.mju_type_id,
      mjuTypeName: t.mju_type_name,
      blocks: [],
    };
  }

  // 2. assignment → block ref로 변환
  for (const a of api.assignments) {
    const bucket = typeMap[a.mju_type_id];
    if (!bucket) continue;

    bucket.blocks.push({
      blockId: a.block_id,
      judgementId: a.judgement_id,
      title: a.title,
      coreQuestion: a.core_question,
      pageStart: a.source_pages.page_start,
      pageEnd: a.source_pages.page_end,
      sectionKey: a.section_key,
      assignmentReason: a.assignment_reason,
    });
  }

  // 3. block_id 기준 정렬 (UI 안정성)
  const types = Object.values(typeMap).map((t) => ({
    ...t,
    blocks: [...t.blocks].sort((a, b) =>
      a.blockId.localeCompare(b.blockId)
    ),
  }));

  return {
    bookId: api.book_id,
    types,
  };
}

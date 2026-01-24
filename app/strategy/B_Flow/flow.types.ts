// B_FLOW/flow.types.ts

/** 백엔드 원본 타입 */
export type RawFlowBlock = {
  block_id: string;
  page_start: number;
  page_end: number;
  flow_stage: string;
  flow_purpose: string;
  transition_trigger: string;
  transition_outcome: string;
};

export type RawFlowResponse = {
  book_id: string;
  flow_blocks: RawFlowBlock[];
};

/** 프론트(UI)용 타입 */
// B_FLOW/flow.types.ts

export type FlowBlock = {
  id: string;                // F01

  pageStart: number;         // ✅ 추가
  pageEnd: number;           // ✅ 추가
  pageRangeLabel: string;    // p.17–23

  stage: string;
  purpose: string;
  trigger: string;
  outcome: string;
};

export type FlowViewModel = {
  bookId: string;
  blocks: FlowBlock[];
};

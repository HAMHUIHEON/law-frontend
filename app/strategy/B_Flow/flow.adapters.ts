// B_FLOW/flow.adapter.ts

import {
  RawFlowResponse,
  FlowViewModel,
  FlowBlock,
} from "./flow.types";

function formatPageRange(start: number, end: number): string {
  return start === end ? `p.${start}` : `p.${start}–${end}`;
}



export function adaptFlowResponse(raw: RawFlowResponse): FlowViewModel {
  return {
    bookId: raw.book_id,
    blocks: raw.flow_blocks.map<FlowBlock>((b) => ({
      id: b.block_id,

      pageStart: b.page_start,     // ✅ 추가
      pageEnd: b.page_end,         // ✅ 추가
      pageRangeLabel: formatPageRange(b.page_start, b.page_end),

      stage: b.flow_stage,
      purpose: b.flow_purpose,
      trigger: b.transition_trigger,
      outcome: b.transition_outcome,
    })),
  };
}

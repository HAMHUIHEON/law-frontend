//law-frontend/app/strategy/Summary/adapters.ts

/* ======================================================
 * Domain Types
 * ====================================================== */

export type SummaryAudienceKey =
  | "public_sector"
  | "supervisory_and_enforcement"
  | "private_sector";

  
export const SUMMARY_AUDIENCE_LABEL: Record<SummaryAudienceKey, string> = {
  public_sector: "공공 부문 정책 설계자",
  supervisory_and_enforcement: "감독·집행 기관",
  private_sector: "민간 의무 주체자",
};

export type StrategicImplicationVM = {
  key: SummaryAudienceKey;
  label: string;
  items: string[];
};


/**
 * Executive Summary Block VM
 * - view에서 필요한 의미 단위만 유지
 */
export type ExecSummaryBlockVM = {
  blockId: string;

  sourceRange?: {
    start?: number;
    end?: number;
  };

  purposeAndScope: string;
  keyFindings: string[];
  crossCuttingRisks: string[];

  strategicImplications: StrategicImplicationVM[];

  priorityFocusAreas: string[];
  howToUseThisReport: string;
};

/**
 * Executive Summary 전체 VM
 */
export type ExecSummaryVM = {
  bookId: string;
  blocks: ExecSummaryBlockVM[];
};


/* ======================================================
 * Adapter
 * ====================================================== */

export function adaptExecSummary(api: any): ExecSummaryVM {
  if (!api || !Array.isArray(api.executive_summary_blocks)) {
    throw new Error(
      "Invalid exec_summary payload: executive_summary_blocks missing"
    );
  }

  
  return {
    bookId: api.book_id,
    blocks: api.executive_summary_blocks.map(
      (b: any): ExecSummaryBlockVM => {
        if (!b.block_id) {
          throw new Error("Invalid summary block: block_id missing");
        }

        const strategicImplications: StrategicImplicationVM[] = (
          Object.keys(SUMMARY_AUDIENCE_LABEL) as SummaryAudienceKey[]
        ).map((key) => ({
          key,
          label: SUMMARY_AUDIENCE_LABEL[key],
          items: Array.isArray(b.strategic_implications?.[key])
            ? b.strategic_implications[key]
            : [],
        }));


        return {
          blockId: b.block_id,

          sourceRange: b.source_section_order_range,

          purposeAndScope: b.purpose_and_scope ?? "",

          keyFindings: Array.isArray(b.key_findings)
            ? b.key_findings
            : [],

          crossCuttingRisks: Array.isArray(b.cross_cutting_risks_and_issues)
            ? b.cross_cutting_risks_and_issues
            : [],

          strategicImplications,

          priorityFocusAreas: Array.isArray(b.priority_focus_areas)
            ? b.priority_focus_areas
            : [],

          howToUseThisReport: b.how_to_use_this_report ?? "",
        };
      }
    ),
  };
}

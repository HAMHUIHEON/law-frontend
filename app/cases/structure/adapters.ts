// app/cases/structure/adapters.ts
export type IssueGroupVM = {
  title: string;
  plaintiff: string[];
  defendant: string[];
  court: string[];
};

export function adaptCaseStructure(api: any) {
  const groups = api.body.issue_frame.issue_groups;

  const issues = Object.keys(groups).map((key) => ({
    title: key,
    plaintiff: groups[key].plaintiff_arguments ?? [],
    defendant: groups[key].defendant_arguments ?? [],
    court: groups[key].court_reasoning ?? [],
  }));

  return {
    meta: {
      caseNumber: api.body.metadata.case_number,
    },
    summary: {
      oneLiner: api.executive_summary?.executive_summary?.one_liner,
      legalDirection:
        api.executive_summary?.executive_summary?.legal_direction,
      practicalImplication:
        api.executive_summary?.executive_summary?.practical_implication,
    },
    issues,
  };
}

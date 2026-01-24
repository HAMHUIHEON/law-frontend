// app/cases/flow/adapters.ts
export function adaptCaseFlow(api: any) {
  return {
    meta: {
      title: api.body.metadata.case_title,
      number: api.body.metadata.case_number,
      court: api.body.metadata.court_name,
      conclusion: api.body.metadata.conclusion,
      keyIssues: api.body.metadata.key_issues,
    },
    summary: {
      what: api.executive_summary.executive_summary?.what_this_case_is_about,
      points: api.executive_summary.executive_summary?.key_points_in_20_words,
      takeaway: api.executive_summary.executive_summary?.micro_takeaway,
    },
    appendix: {
      facts: api.body.narrative.fact_summary,
      plaintiff: api.body.narrative.plaintiff_arguments,
      defendant: api.body.narrative.defendant_arguments,
      court: api.body.narrative.court_reasoning,
      law: api.body.narrative.legal_context,
    },
  };
}

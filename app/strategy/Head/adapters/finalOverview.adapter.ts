// Head/adapters/finalOverview.adapter.ts

export type FinalOverviewVM = {
  thesis: {
    title: string;
    body: string;
  };

  context: {
    title: string;
    body: string;
  };

  keyFindings: {
    title: string;
    items: string[];
  };

  risks: {
    title: string;
    items: string[];
  };

  strategicChoices: {
    title: string;
    items: string[];
  };

  conclusion: {
    title: string;
    body: string;
  };
};

// Head/adapters/finalOverview.adapter.ts

export type FinalOverviewResponse = {
  book_id: string;
  final_executive_overview: {
    core_thesis: string;
    why_it_matters_now: string;
    key_findings: string[];
    cross_cutting_risks_and_issues: string[];
    strategic_choices: string[];
    concluding_synthesis: string;
  };
};

export function adaptFinalOverview(
  raw: FinalOverviewResponse
): FinalOverviewVM {
  const ov = raw.final_executive_overview;

  return {
    thesis: {
      title: "핵심 논지",
      body: ov.core_thesis,
    },

    context: {
      title: "지금 이 이슈가 중요한 이유",
      body: ov.why_it_matters_now,
    },

    keyFindings: {
      title: "주요 분석 결과",
      items: ov.key_findings,
    },

    risks: {
      title: "공통 위험 요인과 구조적 쟁점",
      items: ov.cross_cutting_risks_and_issues,
    },

    strategicChoices: {
      title: "전략적 선택지",
      items: ov.strategic_choices,
    },

    conclusion: {
      title: "종합 결론",
      body: ov.concluding_synthesis,
    },
  };
}

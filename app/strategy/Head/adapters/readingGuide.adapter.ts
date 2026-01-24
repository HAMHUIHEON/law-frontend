// law-frontend/app/strategy/Head/adapters.ts

/* =========================================================
 * 1. Raw API Types (백엔드 JSON 그대로)
 * ======================================================= */

export type StrategicReadingGuideResponse = {
  book_id: string;
  strategic_reading_guide: {
    what_this_report_is_really_about: string;
    core_lines_to_watch: string[];
    who_should_use_this_report_and_how: {
      policy_makers: string;
      supervisors_and_enforcement: string;
      private_sector_practitioners: string;
    };
    fast_reading_paths: {
      decision_intent: string;
      block_ids: string[];
    }[];
  };
};

/* =========================================================
 * 2. View Model Types (프론트에서 쓰는 형태)
 * ======================================================= */

export type HeadReadingGuideVM = {
  intro: {
    title: string;
    body: string;
  };

  coreLines: {
    title: string;
    items: string[];
  };

  audiences: {
    key: "policy_makers" | "supervisors_and_enforcement" | "private_sector_practitioners";
    label: string;   // 👈 한국어
    description: string;
  }[];

  fastPaths: {
    intent: string;
    blocks: string[];
  }[];
};

/* =========================================================
 * 3. Adapter
 * ======================================================= */

export function adaptHeadReadingGuide(
  raw: StrategicReadingGuideResponse
): HeadReadingGuideVM {
  const guide = raw.strategic_reading_guide;

  return {
    intro: {
      title: "이 보고서의 접근 방식 ",
      body: guide.what_this_report_is_really_about,
    },

    coreLines: {
      title: "의사결정자가 주목해야 할 쟁점",
      items: guide.core_lines_to_watch,
    },

    audiences: [
      {
        key: "policy_makers",
        label: "정책·입법·제도 설계자",
        description: guide.who_should_use_this_report_and_how.policy_makers,
      },
      {
        key: "supervisors_and_enforcement",
        label: "감독·집행·조사자",
        description:
          guide.who_should_use_this_report_and_how.supervisors_and_enforcement,
      },
      {
        key: "private_sector_practitioners",
        label: "민간 의무 주체자",
        description:
          guide.who_should_use_this_report_and_how.private_sector_practitioners,
      },
    ],

    fastPaths: guide.fast_reading_paths.map((p) => ({
      intent: p.decision_intent,
      blocks: p.block_ids,
    })),
  };
}
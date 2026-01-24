// C_RISK/adapters.ts

export type RiskTypologyArticleVM = {
  id: string;
  title: string;

  page: {
    start: number;
    end: number;
    label: string;
  };

  tags: {
    crime: string[];
  };

  sections: {
    structuralPattern: string[];
    commonEnablers: string[];
    detectionSignals: string[];
  };

  whyNow: {
    text: string;
    isLong: boolean;
  };
};

export type RiskTypologyViewModel = {
  bookId: string;
  typologies: RiskTypologyArticleVM[];
};

import { RiskTypologyResponse } from "./types";

export function adaptRiskTypology(
  raw: RiskTypologyResponse
): RiskTypologyViewModel {
  return {
    bookId: raw.book_id,
    typologies: raw.risk_typology_blocks.map((b) => ({
      id: b.typology_id,
      title: b.typology_name,

      page: {
        start: b.page_start,
        end: b.page_end,
        label: `p.${b.page_start} – p.${b.page_end}`,
      },

      tags: {
        crime: b.crime_type_tags,
      },

      sections: {
        structuralPattern: b.structural_pattern,
        commonEnablers: b.common_enablers,
        detectionSignals: b.detection_signals,
      },

      whyNow: {
        text: b.why_this_matters_now,
        isLong: b.why_this_matters_now.length > 400,
      },
    })),
  };
}

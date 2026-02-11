import {
  RawChapterOneStep1,
  ChapterOneStep1ViewModel,
} from "./types";

export function adaptChapterOneStep1(
  raw: RawChapterOneStep1
): ChapterOneStep1ViewModel {

  return {
    summary: raw.chapter_summary,

    principles: raw.principle_axis.map((p) => ({
      title: p.principle,
      articles: p.articles,
      meaning: p.practical_meaning,
      evidenceStatus: p.evidence_status,
    })),

    authorities: raw.authority_axis.map((a) => ({
      topic: a.topic,
      articles: a.articles,
      controlFunction: a.control_function,
      evidenceStatus: a.evidence_status,
    })),

    procedureStages: raw.procedure_axis.map((s) => ({
      stage: s.stage,
      articles: s.articles,
      keyControls: s.key_controls,
      evidenceStatus: s.evidence_status,
    })),

    definitionTable: {
      columns: raw.definition_comparison_table.columns,
      rows: raw.definition_comparison_table.rows.map((r) => ({
        category: r.category,
        definition: r.definition_summary,
        authority: r.authority_basis,
        noticeRequirement: r.plan_notice_requirements,
        notes: r.notes,
        evidenceStatus: r.evidence_status,
      })),
    },

    defensePoints: raw.defense_points.map((d) => ({
      scenario: d.scenario,
      articles: d.articles,
      legalRequirement: d.legal_requirement,
      commentary: d.practical_commentary,
      evidenceStatus: d.evidence_status,
    })),

    internalOperations: raw.internal_operation_points.map((i) => ({
      area: i.operation_area,
      articles: i.articles,
      implication: i.operational_implication,
      evidenceStatus: i.evidence_status,
    })),

    bridgeQuestions: raw.bridge_questions.map((b) => ({
      question: b.question,
      nextChapter: b.related_next_chapter,
      why: b.why_it_matters,
    })),

    extraExplanations: raw.extra_explanations.map((e) => ({
      topic: e.topic,
      reasonSeparated: e.reason_separated,
      notes: e.notes,
    })),
  };
}

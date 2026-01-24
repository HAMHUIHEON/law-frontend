// B_BLUEPRINT/blueprint.adapter.ts

import {
  RawBlueprintResponse,
  BlueprintIndex,
  Blueprint,
} from "./blueprint.types";

export function adaptBlueprintResponse(
  raw: RawBlueprintResponse
): BlueprintIndex {
  const byBlockId: Record<string, Blueprint> = {};

  raw.items.forEach((item) => {
    byBlockId[item.block_id] = {
      blockId: item.block_id,

      entryTriggers: item.entry_triggers,

      actions: item.actions.map((a) => ({
        text: a.action,
        purpose: a.purpose,
        prerequisites: a.prerequisites,
      })),

      decisionPoints: item.decision_points.map((d) => ({
        condition: d.condition,
        options: d.options,
        implications: d.implications,
      })),

      escalationPaths: item.escalation_paths.map((e) => ({
        trigger: e.trigger,
        target: e.target,
        requirements: e.handover_requirements,
      })),

      stopLines: item.stop_lines,
      requiredArtifacts: item.required_artifacts,
    };
  });

  return {
    bookId: raw.book_id,
    blockIds: raw.items.map((i) => i.block_id), // 🔑 sidebar
    byBlockId,
  };
}

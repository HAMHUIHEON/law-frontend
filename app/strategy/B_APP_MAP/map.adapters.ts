// B_APP_MAP/map.adapter.ts

import {
  RawOperationalMap,
  OperationalMapViewModel,
  ConditionalBlockGroup,
  SetupGroup,
} from "./map.types";

export function adaptOperationalMap(
  raw: RawOperationalMap
): OperationalMapViewModel {
  const conditionalBlocks: ConditionalBlockGroup[] =
    Object.entries(raw.conditional_blocks).map(
      ([condition, blockIds]) => ({
        condition,
        blockIds,
      })
    );

  const minimumViableSetups: SetupGroup[] =
    Object.entries(raw.minimum_viable_setup).map(
      ([label, blockIds]) => ({
        label,
        blockIds,
      })
    );

  const advancedSetups: SetupGroup[] =
    Object.entries(raw.advanced_setup).map(
      ([label, blockIds]) => ({
        label,
        blockIds,
      })
    );

  return {
    bookId: raw.book_id,

    investigationPhases: raw.investigation_phases,

    alwaysOnBlocks: raw.always_on_blocks,
    conditionalBlocks,

    keyDecisionBottlenecks: raw.key_decision_bottlenecks,

    minimumViableSetups,
    advancedSetups,

    organisationalNotes: raw.organisational_adaptation_notes,
    usageGuide: raw.how_to_use_this_blueprint,
  };
}

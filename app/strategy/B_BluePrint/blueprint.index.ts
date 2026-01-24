// B_BLUEPRINT/blueprint.index.ts

import { BlueprintIndex, Blueprint } from "./blueprint.types";

export function getBlueprintBlockIds(
  index: BlueprintIndex
): string[] {
  return index.blockIds;
}

export function getBlueprintById(
  index: BlueprintIndex,
  blockId: string
): Blueprint | null {
  return index.byBlockId[blockId] ?? null;
}

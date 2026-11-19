export interface LayoutToCheck {
  id: string;
  circuitId: string;
  /** First season in which a race was held on the layout */
  firstSeason: number;
}

/**
 * Soft checks of the circuit layouts. They only return warnings, since the rules of what a new layout is
 * (see ADR 0001) need a human: the same length and corners in two consecutive layouts, for example, can be
 * right (the lap changed in another way) so it is not checked.
 */
export function checkLayouts(layouts: LayoutToCheck[]): string[] {
  const warnings: string[] = [];

  for (const { id, circuitId, firstSeason } of layouts) {
    // The id keeps its first season: after splitting a layout the new rows need a new id
    if (id.toLowerCase() !== `${circuitId}-${firstSeason}`.toLowerCase()) {
      warnings.push(
        `Layout "${id}" should be called "${circuitId}-${firstSeason}": ${firstSeason} is the first season it was raced`
      );
    }
  }

  return warnings;
}

import { describe, expect, test } from 'vitest';
import { checkLayouts } from '../../../data/db-layout-checks';

describe('Test the soft checks of the circuit layouts', () => {
  test('A layout called after its circuit and first season has no warnings', () => {
    expect(
      checkLayouts([
        { id: 'silverstone-2010', circuitId: 'silverstone', firstSeason: 2010 }
      ])
    ).toEqual([]);
  });

  test('A layout whose id has another season is warned about', () => {
    const [warning] = checkLayouts([
      { id: 'silverstone-1950', circuitId: 'silverstone', firstSeason: 1952 }
    ]);

    expect(warning).toContain('silverstone-1952');
  });
});

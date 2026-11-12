import { describe, expect, test } from 'vitest';
import { CircuitDTO } from '../../models/types.dto';
import { getUrlResponseForTesting } from '../../utils/test/test-utils';

describe('Test circuits functionality', () => {
  test('The previous names of a circuit are a list', async () => {
    const res = await getUrlResponseForTesting<CircuitDTO>('/circuits/aida');

    expect(res.previousNames).toEqual(['TI Circuit Aida']);
  });

  test('A circuit without previous names returns null', async () => {
    const res =
      await getUrlResponseForTesting<CircuitDTO>('/circuits/adelaide');

    expect(res.previousNames).toBeNull();
  });
});

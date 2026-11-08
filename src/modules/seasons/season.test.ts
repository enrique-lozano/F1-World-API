import { describe, expect, test } from 'vitest';
import { getUrlResponseForTesting } from '../../utils/test/test-utils';

describe('Test seasons functionality', () => {
  test('Get all the seasons in ascending order', async () => {
    const res = await getUrlResponseForTesting<number[]>('/seasons');

    expect(res[0]).toBe(1950);
    expect(res).toContain(2021);
    expect(res).toEqual([...res].sort((a, b) => a - b));
    expect(new Set(res).size).toBe(res.length);
    expect(res.every((x) => Number.isInteger(x))).toBe(true);
  });
});

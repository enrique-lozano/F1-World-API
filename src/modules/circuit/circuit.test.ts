import { describe, expect, test } from 'vitest';
import { CircuitDTO, SessionDTO } from '../../models/types.dto';
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

  test('Every circuit has a time zone', async () => {
    const res = await getUrlResponseForTesting<CircuitDTO>('/circuits/aida');

    expect(res.timeZone).toBe('Asia/Tokyo');
  });

  test('The sessions of a recent weekend have their start time in UTC', async () => {
    const res =
      await getUrlResponseForTesting<SessionDTO[]>('/sessions/2023/1');

    expect(res.find((x) => x.abbreviation == 'FP1')?.startDateTime).toBe(
      '2023-03-03T11:30:00Z'
    );
    expect(res.find((x) => x.abbreviation == 'R')?.startDateTime).toBe(
      '2023-03-05T15:00:00Z'
    );
  });
});

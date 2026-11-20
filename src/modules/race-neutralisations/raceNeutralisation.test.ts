import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import { RaceNeutralisationDTO } from '../../models/dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

const endPoint = '/race-neutralisations';

describe('Test race neutralisations functionality', () => {
  test('Invalid filters should trigger validation errors', async () => {
    await getUrlForTesting(endPoint, { kind: 'GREEN_FLAG' }).expect(422);
  });

  test('A race has its neutralisations in order', async () => {
    const res = await getUrlResponseForTesting<
      PaginatedItems<RaceNeutralisationDTO>
    >(endPoint, {
      season: '2022',
      round: '1',
      session: 'R',
      include: 'number,kind,lapStart,lapEnd'
    });

    // The virtual safety car came out first and was followed by the safety car on the same lap
    expect(res.data.map((x) => x.kind)).toEqual([
      'FULL_COURSE_YELLOW',
      'SAFETY_CAR'
    ]);
    expect(res.data.map((x) => x.number)).toEqual([1, 2]);
    expect(res.data[1]).toMatchObject({ lapStart: 46, lapEnd: 51 });
  });

  test('The red flags keep the data of the old table', async () => {
    const res = await getUrlResponseForTesting<
      PaginatedItems<RaceNeutralisationDTO>
    >(endPoint, {
      season: '1976',
      kind: 'RED_FLAG',
      include: 'kind,lapStart,resumed,session.id'
    });

    expect(res.data.map((x) => x.session?.id)).toEqual([
      '1976-09-R',
      '1976-10-R'
    ]);
    expect(res.data.every((x) => x.resumed === 'Y')).toBe(true);
  });
});

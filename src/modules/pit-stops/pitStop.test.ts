import { PaginatedItems } from '../../models/pagination';
import { PitStopDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

const endPoint = '/pit-stops';

describe('Test pit stops functionality', () => {
  test('Laps should trigger validation errors', (done) => {
    getUrlForTesting(endPoint, {
      season: 'ddcc'
    })
      .expect(422)
      .end(done);
  });

  test('Get all pit stops without filters', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<PitStopDTO>>(
      endPoint,
      {}
    );

    expect(res.totalElements).toBeGreaterThan(11);
    expect(res.data.length).toBe(10);
  });
});

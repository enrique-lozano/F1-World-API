import { PaginatedItems } from '../../models/pagination';
import { EventDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test events functionality', () => {
  test('Companies should trigger validation errors', (done) => {
    getUrlForTesting('/events', {
      pageSize: 'ddcc'
    })
      .expect(422)
      .end(done);
  });

  test('Get all events without filters', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EventDTO>>(
      '/events',
      {}
    );

    expect(res.totalElements).toBeGreaterThan(11);
    expect(res.data.length).toBe(10);
  });

  test('Custom events pagination size works', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EventDTO>>(
      '/events',
      {
        pageSize: '20'
      }
    );

    expect(res.totalElements).toBeGreaterThan(20);
    expect(res.data.length).toBe(20);
  });

  test('Get event by season and round', async () => {
    const season = 1965;
    const round = 3;

    const res = await getUrlResponseForTesting<EventDTO>(
      `/events/${season}/${round}`
    );

    expect(res.id).toBeDefined();
  });
});

import { PaginatedItems } from '../../models/pagination';
import { DriverDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test drivers functionality', () => {
  test('Drivers should trigger validation errors', (done) => {
    getUrlForTesting('/drivers', {
      birthAfter: 'ddcc'
    })
      .expect(422)
      .end(done);
  });

  test('Get all drivers without filters', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/drivers',
      {}
    );

    expect(res.totalElements).toBeGreaterThan(11);
    expect(res.data.length).toBe(10);
  });

  test('Custom drivers pagination size works', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/drivers',
      {
        pageSize: '20'
      }
    );

    expect(res.totalElements).toBeGreaterThan(20);
    expect(res.data.length).toBe(20);
  });

  test('Get drivers by name', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/drivers',
      {
        name: 'alonso'
      }
    );

    expect(res.data.some((x) => x.id == 'fernando-alonso')).toBe(true);
  });

  test('Get driver by ID', async () => {
    const idToGet = 'adrian-sutil';

    const res = await getUrlResponseForTesting<DriverDTO>(
      `/drivers/${idToGet}`
    );

    expect(res.id).toBe(idToGet);
  });
});

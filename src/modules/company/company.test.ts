import { PaginatedItems } from '../../models/pagination';
import { CompanyDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test companies functionality', () => {
  test('Companies should trigger validation errors', (done) => {
    getUrlForTesting('/companies', {
      pageSize: 'ddcc'
    })
      .expect(422)
      .end(done);
  });

  test('Get all companies without filters', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<CompanyDTO>>(
      '/companies',
      {}
    );

    expect(res.totalElements).toBeGreaterThan(11);
    expect(res.data.length).toBe(10);
  });

  test('Custom companies pagination size works', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<CompanyDTO>>(
      '/companies',
      {
        pageSize: '20'
      }
    );

    expect(res.totalElements).toBeGreaterThan(20);
    expect(res.data.length).toBe(20);
  });

  test('Get company by ID', async () => {
    const idToGet = 'ferrari';

    const res = await getUrlResponseForTesting<CompanyDTO>(
      `/companies/${idToGet}`
    );

    expect(res.id).toBe(idToGet);
  });
});

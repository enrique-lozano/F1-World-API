import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import { DriverDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test grands prix functionality', () => {
  test('Grands prix should trigger validation errors', async () => {
    await getUrlForTesting('/grands-prix', {
      pageSize: 'ddcc'
    }).expect(422);
  });

  test('Get all grands prix without filters', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/grands-prix',
      {}
    );

    expect(res.totalElements).toBeGreaterThan(11);
    expect(res.data.length).toBe(10);
  });

  test('Custom grands prix pagination size works', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<DriverDTO>>(
      '/grands-prix',
      {
        pageSize: '20'
      }
    );

    expect(res.totalElements).toBeGreaterThan(20);
    expect(res.data.length).toBe(20);
  });

  test('Get company by ID', async () => {
    const idToGet = 'brazil';

    const res = await getUrlResponseForTesting<DriverDTO>(
      `/grands-prix/${idToGet}`
    );

    expect(res.id).toBe(idToGet);
  });
});

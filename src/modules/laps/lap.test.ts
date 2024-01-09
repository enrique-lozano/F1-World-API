import { describe } from 'node:test';
import { PaginatedItems } from '../../models/pagination';
import { LapTimeDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test lap times functionality', () => {
  test('Laps should trigger validation errors', (done) => {
    getUrlForTesting('/laps', {
      season: 'ddcc'
    })
      .expect(422)
      .end(done);
  });

  test('Laps should trigger validation errors', (done) => {
    getUrlForTesting('/laps/fastest', {
      season: 'ddcc'
    })
      .expect(422)
      .end(done);
  });

  test('Default laps pagination limit works', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<LapTimeDTO>>(
      '/laps',
      {
        season: '2020'
      }
    );

    expect(res.totalElements).toBeGreaterThan(11);
    expect(res.data.length).toBe(10);
  });

  test('Custom laps pagination size works', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<LapTimeDTO>>(
      '/laps',
      {
        pageSize: '20',
        season: '2020'
      }
    );

    expect(res.totalElements).toBeGreaterThan(20);
    expect(res.data.length).toBe(20);
  });

  test('Default fastest laps pagination limit works', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<LapTimeDTO>>(
      '/laps/fastest',
      {
        driverId: 'fernando-alonso'
      }
    );

    expect(res.totalElements).toBeGreaterThan(11);
    expect(res.data.length).toBe(10);
  });

  test('Custom fastest laps pagination size works', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<LapTimeDTO>>(
      '/laps/fastest',
      {
        pageSize: '20',
        driverId: 'fernando-alonso'
      }
    );

    expect(res.totalElements).toBeGreaterThan(20);
    expect(res.data.length).toBe(20);
  });

  test('The number of main races fastest laps in a season should match the number of season grands prix', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<LapTimeDTO>>(
      '/laps/fastest',
      {
        season: '2010',
        session: 'R'
      }
    );

    expect(res.totalElements).toBe(19);
  });

  test('Should returns only one fastest lap per session', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<LapTimeDTO>>(
      '/laps/fastest',
      {
        season: '2012',
        round: '2',
        session: 'R'
      }
    );

    expect(res.totalElements).toBe(1);
    expect(res.data.length).toBe(1);
  });

  test('There are a lot of laps registered in the F1-World database!', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<LapTimeDTO>>(
      '/laps'
    );

    expect(res.totalElements).toBeGreaterThan(50000);
  });

  test('Felipe Massa has 15 fastest laps in his career', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<LapTimeDTO>>(
      '/laps/fastest',
      {
        driverId: 'felipe-massa'
      }
    );

    expect(res.totalElements).toBe(15);
  });

  test('Marcus Ericsson completes exactly 3 laps on the 2015 Malasian GP', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<LapTimeDTO>>(
      '/laps',
      {
        driverId: 'marcus-ericsson',
        season: '2015',
        round: '2',
        session: 'R'
      }
    );

    expect(res.totalElements).toBe(3);
  });

  test('Vitantonio Liuzzi was 11th on the lap 8 of the 2007 Malasian GP', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<LapTimeDTO>>(
      '/laps',
      {
        driverId: 'vitantonio-liuzzi',
        season: '2007',
        round: '7',
        session: 'R',
        lap: '8'
      }
    );

    // Test also that we only return one lap-time when driver, lap and session is specified:
    expect(res.totalElements).toBe(1);
    expect(res.data.length).toBe(1);

    expect(res.data[0].pos).toBe(11);
  });
});

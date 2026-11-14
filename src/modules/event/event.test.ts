import { describe, expect, test } from 'vitest';
import { PaginatedItems } from '../../models/pagination';
import { EventDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test events functionality', () => {
  test('Companies should trigger validation errors', async () => {
    await getUrlForTesting('/events', {
      pageSize: 'ddcc'
    }).expect(422);
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

  test('Events expose the season, the round and the grand prix', async () => {
    const res = await getUrlResponseForTesting<EventDTO>('/events/2021/1');

    expect(res.season).toBe(2021);
    expect(res.round).toBe(1);
    expect(res.grandPrix?.id).toBe('bahrain');
    expect(res.circuit?.id).toBe('bahrain');
  });

  test('The circuit can be included alone', async () => {
    const res = await getUrlResponseForTesting<EventDTO>('/events/2021/1', {
      include: 'id,circuit.id'
    });

    expect(res).toEqual({ id: '2021-01', circuit: { id: 'bahrain' } });
  });

  test('Filter events by season', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EventDTO>>(
      '/events',
      { season: '2021', pageSize: '50' }
    );

    expect(res.totalElements).toBe(22);
    expect(res.data.every((x) => x.season === 2021)).toBe(true);
    expect(res.data.map((x) => x.round)).toEqual(
      Array.from({ length: 22 }, (_, i) => i + 1)
    );
  });

  test('Filter events by grand prix and sort them in descending order', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EventDTO>>(
      '/events',
      { grandPrixId: 'monaco', sort: '-id' }
    );

    expect(res.totalElements).toBeGreaterThan(60);
    expect(res.data.every((x) => x.grandPrix?.id === 'monaco')).toBe(true);
    expect(res.data[0].season).toBeGreaterThan(res.data[1].season);
  });

  test('Search events by name (case-insensitive)', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EventDTO>>(
      '/events',
      { name: 'MONACO', season: '2021' }
    );

    expect(res.totalElements).toBe(1);
    expect(res.data[0].id).toBe('2021-05');
  });

  test('Sort events by round inside a season', async () => {
    const res = await getUrlResponseForTesting<PaginatedItems<EventDTO>>(
      '/events',
      { season: '2021', sort: '-round', include: 'id,round' }
    );

    expect(res.data[0]).toEqual({ id: '2021-22', round: 22 });
  });

  test('The names of the events keep their accents', async () => {
    const res = await getUrlResponseForTesting<EventDTO>('/events/1989/1', {
      include: 'name'
    });

    expect(res.name).toBe('Grande Prêmio do Brasil 1989');

    const austria = await getUrlResponseForTesting<EventDTO>('/events/1964/7', {
      include: 'name'
    });

    expect(austria.name).toBe('Grosser Preis von Österreich 1964');
  });
});

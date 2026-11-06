import { describe, expect, test } from 'vitest';
import { CountryDTO } from '../../models/types.dto';
import {
  getUrlForTesting,
  getUrlResponseForTesting
} from '../../utils/test/test-utils';

describe('Test countries functionality', () => {
  test('Country names are in English by default', async () => {
    const res = await getUrlResponseForTesting<CountryDTO>('/countries/ES');

    expect(res.commonName).toBe('Spain');
  });

  test('Country names can be translated with the locale param', async () => {
    const res = await getUrlResponseForTesting<CountryDTO>('/countries/ES', {
      locale: 'es'
    });

    expect(res.commonName).toBe('España');
  });

  test('Nested countries are translated too', async () => {
    const res = await getUrlResponseForTesting<{
      data: { country: CountryDTO }[];
    }>('/circuits', { locale: 'es', include: 'country', pageSize: '100' });

    expect(res.data.some((c) => c.country?.commonName === 'España')).toBe(true);
  });

  test('An unsupported locale should trigger a validation error', async () => {
    await getUrlForTesting('/countries', { locale: 'not a locale' }).expect(
      422
    );
  });

  test('Every country has a name', async () => {
    const res = await getUrlResponseForTesting<CountryDTO[]>('/countries');

    expect(res.length).toBe(250);
    expect(
      res.every((c) => c.commonName && c.commonName !== c.alpha2Code)
    ).toBe(true);
  });
});

import request from 'supertest';
import { describe, expect, test } from 'vitest';
import app, { BASE_PATH } from './app';
import { getUrlForTesting } from './utils/test/test-utils';

describe('Test CORS', () => {
  test('Any origin can read the API', async () => {
    const res = await getUrlForTesting('/drivers/adrian-sutil').set(
      'Origin',
      'https://example.com'
    );

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  test('Preflight requests are answered', async () => {
    const res = await request(app)
      .options(`${BASE_PATH}/drivers`)
      .set('Origin', 'https://example.com')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toBe(
      'GET,HEAD,OPTIONS'
    );
  });
});

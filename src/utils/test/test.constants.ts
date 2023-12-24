import request from 'supertest';
import app, { BASE_PATH } from '../../app';

export async function getUrlResponseForTesting<ReturnType = any>(
  path: string,
  queryParams?: Record<string, string>
) {
  return (
    await request(app).get(
      BASE_PATH + path + '?' + new URLSearchParams(queryParams).toString()
    )
  ).body as ReturnType;
}

import request from 'supertest';
import app, { BASE_PATH } from '../../app';

export async function getUrlResponseForTesting<ReturnType = any>(
  path: string,
  queryParams?: Record<string, string>
) {
  return (await getUrlForTesting(path, queryParams)).body as ReturnType;
}

export function getUrlForTesting(
  path: string,
  queryParams?: Record<string, string>
) {
  return request(app).get(
    BASE_PATH + path + '?' + new URLSearchParams(queryParams).toString()
  );
}

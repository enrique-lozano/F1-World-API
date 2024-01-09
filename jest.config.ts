import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testTimeout: 7000,
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.ts']
};

export default config;

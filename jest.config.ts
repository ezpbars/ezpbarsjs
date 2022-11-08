// export default {
//   preset: 'ts-jest',
//   transform: {
//     '^.+\\.(ts|tsx)?$': 'ts-jest',
//     '^.+\\.(js|jsx)$': 'babel-jest',
//   },
// };

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
import type { Config } from 'jest';

const config: Config = {
  transform: {
    '\\.[jt]sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '(.+)\\.js': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
};

export default config;

/**
 * vitest.config.ts — minimal Vitest configuration for unit tests.
 * [design §12.6] [spec 8.10]
 *
 * jsdom environment: needed for DOM API availability in tests.
 * scripts/ — contrast validation.
 * lib/ — unit tests.
 * components/ — component unit tests.
 * __tests__/smoke/ — smoke tests (middleware config, server actions). [task 14.3–14.5]
 */

import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Mirror tsconfig.json paths: @/* → project root
      '@': resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    include: [
      'scripts/**/*.ts',
      'lib/**/*.test.ts',
      'components/**/*.test.ts',
      '__tests__/**/*.test.ts',
    ],
    globals: false,
  },
});

/**
 * vitest.config.ts — minimal Vitest configuration for unit tests.
 * [design §12.6] [spec 8.10]
 *
 * jsdom environment: needed for DOM API availability in tests.
 * Only scripts/ and lib/ are included in test pattern for now;
 * component tests can be added in future slices.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['scripts/**/*.ts', 'lib/**/*.test.ts', 'components/**/*.test.ts'],
    globals: false,
  },
});

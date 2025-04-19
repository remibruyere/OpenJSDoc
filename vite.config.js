/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    pool: 'threads',
    workspace: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
        },
      },
    ],
  },
});

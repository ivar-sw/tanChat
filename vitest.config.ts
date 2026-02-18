import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    // vitest 2.x bundles vite 5 types; our vite-tsconfig-paths uses vite 7
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }) as any,
  ],
  test: {
    setupFiles: ['./src/testSetup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    environment: 'jsdom',
    env: {
      JWT_SECRET: 'test-secret-key-for-testing',
    },
  },
})

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts', './src/test/integration-setup.ts'],
      globals: true,
      include: ['**/*.integration.test.{js,ts,tsx}'],
      testTimeout: 30000,
      hookTimeout: 30000,
      // Run tests sequentially to avoid database conflicts
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },
      env: {
        DATABASE_URL: env.DATABASE_URL,
        DIRECT_URL: env.DIRECT_URL,
        NEXTAUTH_URL: env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: env.NEXTAUTH_SECRET,
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
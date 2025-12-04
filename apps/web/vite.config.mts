/// <reference types='vitest' />
import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

export const envPath = path.resolve(process.cwd(), '..', '..');

export default defineConfig(({ mode }) => {
  const { API_ORIGIN, HOST, FRONTEND_PORT, PUBLIC_ORIGIN } = loadEnv(mode, envPath, '');

  return {
    define: {
      'process.env': {
        API_ORIGIN,
        FRONTEND_PORT,
        HOST,
        PUBLIC_ORIGIN,
      },
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
    },
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/apps/react-web',
    server: {
      port: 3001,
      host: 'localhost',
    },
    preview: {
      // port: parseInt(FRONTEND_PORT),
      // host: HOST,
      port: 3001,
      host: 'localhost',
    },
    plugins: [react()],
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [],
    // },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: './dist',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});

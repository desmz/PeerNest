/// <reference types='vitest' />

import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

export const envPath = path.resolve(process.cwd(), '..', '..');

export default defineConfig(({ mode }) => {
  const { HOST, FRONTEND_PORT } = loadEnv(mode, envPath, '');

  return {
    define: {
      'process.env': {
        FRONTEND_PORT,
        HOST,
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
      port: parseInt(FRONTEND_PORT),
      host: HOST,
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

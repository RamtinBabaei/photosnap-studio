import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['terminal.local'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        configure(proxy) {
          // The two local development ports have different origins. Only rewrite
          // our known frontend origins; the production Worker still requires same-origin requests.
          proxy.on('proxyReq', (outgoing, incoming) => {
            if (
              [
                'http://localhost:4173',
                'http://127.0.0.1:4173',
                'http://terminal.local:4173',
              ].includes(incoming.headers.origin ?? '')
            )
              outgoing.setHeader('Origin', 'http://127.0.0.1:8787');
          });
        },
      },
    },
  },
  build: { target: 'es2022', sourcemap: false },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});

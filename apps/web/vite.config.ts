import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    dedupe: ['react', 'react-dom', '@telegram-apps/telegram-ui'],
  },
  server: {
    port: 5173,
    strictPort: true,
    allowedHosts: ['semistratified-lacie-skyward.ngrok-free.dev'],
  },
});

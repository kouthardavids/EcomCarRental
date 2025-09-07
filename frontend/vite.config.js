import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // if using React

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5178,
    strictPort: true,
  },
});

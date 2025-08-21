import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // if using React

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175, // choose your preferred port
    strictPort: true, // prevents automatic switching if port is busy
  },
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Set the host to 0.0.0.0 to allow connections from outside the local network
    port: 3000, // Set the port to 3000
  },
})

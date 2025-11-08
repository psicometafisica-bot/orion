import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react() 
  ],
  server: {
    host: 'orion.tech',
    port: 4443,
    https: {
      key: './.certs/orion.tech-key.pem', // Ruta a tu clave
      cert: './.certs/orion.tech.pem'     // Ruta a tu certificado
    }
  }
});
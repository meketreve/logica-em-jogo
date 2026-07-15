import { defineConfig } from "vite";

export default defineConfig({
  // host: true escuta em 0.0.0.0 — sem isso o Vite só atende localhost e os
  // alunos do lab não abrem o cliente pela LAN (achado da fase de cenários).
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 5173,
    host: true,
  },
});

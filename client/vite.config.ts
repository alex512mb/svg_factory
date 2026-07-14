import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Relative base works on GitHub Pages for any repo name (project or user site).
const base = process.env.VITE_BASE_PATH || "./";

export default defineConfig({
  base,
  root: path.resolve(__dirname),
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: path.resolve(__dirname, "../dist"),
    emptyOutDir: true,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "dist-wordpress",
    emptyOutDir: true,
    cssCodeSplit: false,
    rolldownOptions: {
      input: "src/wordpress.tsx",
      output: {
        entryFileNames: "main.js",
        assetFileNames: (asset) =>
          asset.name?.endsWith(".css") ? "main.css" : "assets/[name][extname]",
        inlineDynamicImports: true,
      },
    },
  },
});

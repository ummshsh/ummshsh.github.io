import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://ummshsh.github.io",
  // base: "/github-pages", // Commented out for local development
  output: "static",
  trailingSlash: "ignore",
  build: {
    format: "file",
  },
  markdown: {},
  vite: {
    // Configure Vite to handle markdown imports better
    assetsInclude: ["**/*.md"],
  },
});

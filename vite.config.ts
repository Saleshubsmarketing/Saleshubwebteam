import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { fileURLToPath } from "node:url";

// Netlify sets NETLIFY=true during its build. The MCP server package
// dynamically imports "cloudflare:workers", which only exists in the
// Lovable server runtime. Alias that import to an inert compatibility module
// for Netlify's static build; externalization is insufficient because Nitro's
// server build performs its own import-resolution pass.
const isNetlify = Boolean(process.env.NETLIFY);
const netlifyWorkersShim = fileURLToPath(
  new URL("./src/shims/cloudflare-workers.ts", import.meta.url),
);

export default defineConfig({
  plugins: [mcpPlugin()],
  ...(isNetlify
    ? {
        resolve: {
          alias: {
            "cloudflare:workers": netlifyWorkersShim,
          },
        },
        build: {
          rollupOptions: {
            external: [],
          },
        },
      }
    : {}),
  tanstackStart: {
    server: { entry: "server" },
  },
});

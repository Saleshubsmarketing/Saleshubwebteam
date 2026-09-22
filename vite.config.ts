import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// Netlify sets NETLIFY=true during its build. The MCP server package
// dynamically imports "cloudflare:workers", which only exists in the
// Lovable server runtime — Netlify's static build cannot resolve it, so we
// mark it external there (Netlify never runs the server bundle anyway).
const isNetlify = process.env.NETLIFY === "true";

export default defineConfig({
  plugins: [mcpPlugin()],
  ...(isNetlify
    ? {
        build: {
          rollupOptions: {
            external: [/^cloudflare:/],
          },
        },
      }
    : {}),
  tanstackStart: {
    server: { entry: "server" },
  },
});

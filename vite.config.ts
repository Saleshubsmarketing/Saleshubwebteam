import netlify from "@netlify/vite-plugin-tanstack-start";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

export default defineConfig({
  plugins: [netlify(), mcpPlugin()],
  nitro: false,
  tanstackStart: {
    server: { entry: "server" },
  },
});

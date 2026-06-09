import netlify from "@netlify/vite-plugin-tanstack-start";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  plugins: [netlify()],
  nitro: false,
  tanstackStart: {
    server: { entry: "server" },
  },
});

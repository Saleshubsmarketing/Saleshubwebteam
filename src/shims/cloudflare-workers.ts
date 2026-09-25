// Netlify builds the client as static files and has no Cloudflare runtime.
// This empty binding keeps the shared MCP package buildable there; the module
// is never used by the static site at runtime.
export const env: Record<string, string | undefined> = {};
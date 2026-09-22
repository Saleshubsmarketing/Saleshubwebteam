import { createFileRoute } from "@tanstack/react-router";
import { submitLead, type LeadInput } from "@/lib/leads.functions";

const ALLOWED_ORIGINS = new Set([
  "https://saleshubsweboffice.com",
  "https://www.saleshubsweboffice.com",
]);

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://saleshubsweboffice.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export const Route = createFileRoute("/api/public/leads")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) =>
        new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) }),
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        const headers = { "Content-Type": "application/json", ...corsHeaders(origin) };
        if (origin && !ALLOWED_ORIGINS.has(origin)) {
          return new Response(JSON.stringify({ ok: false, error: "Origin not allowed" }), {
            status: 403,
            headers,
          });
        }

        try {
          const data = (await request.json()) as LeadInput;
          const result = await submitLead({ data });
          return new Response(JSON.stringify(result), {
            status: result.ok ? 200 : 400,
            headers,
          });
        } catch (error) {
          console.error("[public-leads] submission failed", error);
          return new Response(
            JSON.stringify({ ok: false, error: "Could not send your request. Please try again." }),
            { status: 400, headers },
          );
        }
      },
    },
  },
});
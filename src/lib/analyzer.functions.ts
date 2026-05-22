import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  url: z.string().trim().min(4).max(2048),
});

const auditTool = {
  type: "function" as const,
  function: {
    name: "return_audit",
    description: "Return a structured website audit",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string", description: "2-3 sentence executive summary" },
        scores: {
          type: "object",
          properties: {
            performance: { type: "integer", minimum: 0, maximum: 100 },
            seo: { type: "integer", minimum: 0, maximum: 100 },
            mobile: { type: "integer", minimum: 0, maximum: 100 },
            ux: { type: "integer", minimum: 0, maximum: 100 },
            conversion: { type: "integer", minimum: 0, maximum: 100 },
            accessibility: { type: "integer", minimum: 0, maximum: 100 },
          },
          required: ["performance", "seo", "mobile", "ux", "conversion", "accessibility"],
          additionalProperties: false,
        },
        categories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                enum: ["Performance", "SEO", "Mobile", "UX", "Conversion", "Accessibility", "Broken Links"],
              },
              findings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    severity: { type: "string", enum: ["critical", "warning", "info"] },
                    title: { type: "string" },
                    detail: { type: "string" },
                    impact: { type: "string", description: "Projected business impact" },
                  },
                  required: ["severity", "title", "detail", "impact"],
                  additionalProperties: false,
                },
              },
            },
            required: ["name", "findings"],
            additionalProperties: false,
          },
        },
        recommendations: {
          type: "array",
          description: "Top 5-8 prioritized fixes ordered by leverage",
          items: {
            type: "object",
            properties: {
              priority: { type: "string", enum: ["high", "medium", "low"] },
              title: { type: "string" },
              detail: { type: "string" },
              effort: { type: "string", enum: ["low", "medium", "high"] },
            },
            required: ["priority", "title", "detail", "effort"],
            additionalProperties: false,
          },
        },
      },
      required: ["summary", "scores", "categories", "recommendations"],
      additionalProperties: false,
    },
  },
};

function normalizeUrl(input: string) {
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    return new URL(u).toString();
  } catch {
    return null;
  }
}

export const analyzeWebsite = createServerFn({ method: "POST" })
  .inputValidator((d) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const url = normalizeUrl(data.url);
    if (!url) {
      return { ok: false as const, error: "Please enter a valid URL." };
    }

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      return { ok: false as const, error: "AI gateway is not configured." };
    }

    const system = [
      "You are NovaCommerce — an elite eCommerce growth agency's senior auditor.",
      "Given a website URL (a Shopify or DTC brand store), produce a realistic, opinionated, prioritized audit.",
      "Cover: Performance, SEO, Mobile, UX, Conversion (CRO), Accessibility, and Broken Links.",
      "Each finding must be specific, actionable, and tied to revenue impact. No fluff, no disclaimers.",
      "Scores 0-100. Be honest — most stores score 55-80. Reserve 90+ for clearly excellent.",
      "Always call the return_audit tool. Never reply in plain text.",
    ].join(" ");

    let resp: Response;
    try {
      resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: `Audit this website: ${url}` },
          ],
          tools: [auditTool],
          tool_choice: { type: "function", function: { name: "return_audit" } },
        }),
      });
    } catch (e) {
      console.error("AI gateway fetch failed", e);
      return { ok: false as const, error: "Audit service unreachable. Try again." };
    }

    if (resp.status === 429) {
      return { ok: false as const, error: "We're rate limited. Please try again in a minute." };
    }
    if (resp.status === 402) {
      return { ok: false as const, error: "AI credits exhausted. Add funds in Workspace > Usage." };
    }
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      console.error("AI gateway error", resp.status, body);
      return { ok: false as const, error: `Audit failed (${resp.status}).` };
    }

    const json = await resp.json().catch(() => null) as any;
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = call?.function?.arguments;
    if (!argsStr) {
      return { ok: false as const, error: "Audit returned no data." };
    }

    try {
      const parsed = JSON.parse(argsStr);
      return { ok: true as const, url, audit: parsed };
    } catch {
      return { ok: false as const, error: "Failed to parse audit." };
    }
  });
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  url: z.string().trim().min(3).max(2048),
  niche: z.string().trim().min(2).max(120),
  goal: z.string().trim().max(500).optional().default(""),
});

type Section = { title: string; items: string[] };
type AdvisorOk = { ok: true; summary: string; sections: Section[] };
type AdvisorErr = { ok: false; error: string };

export const growthAdvisor = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }): Promise<AdvisorOk | AdvisorErr> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false, error: "AI gateway not configured." };

    const prompt = `You are a senior eCommerce growth strategist. Analyze the store and produce concrete, prioritized recommendations.

Store URL: ${data.url}
Niche: ${data.niche}
Goal: ${data.goal || "Increase revenue and conversion rate"}

Return ONLY valid JSON in this exact shape (no markdown, no commentary):
{
  "summary": "2-3 sentence strategic summary",
  "sections": [
    { "title": "SEO", "items": ["...", "..."] },
    { "title": "Conversion Funnel", "items": ["...", "..."] },
    { "title": "Email Marketing", "items": ["...", "..."] },
    { "title": "Paid Ads", "items": ["...", "..."] },
    { "title": "Pinterest & Social", "items": ["...", "..."] }
  ]
}
Each section must have 4-6 concrete, store-specific action items.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        if (res.status === 429) return { ok: false, error: "Rate limit hit. Try again in a moment." };
        if (res.status === 402) return { ok: false, error: "AI credits exhausted. Top up Lovable AI." };
        return { ok: false, error: `AI request failed (${res.status}).` };
      }
      const j: any = await res.json();
      const content = j?.choices?.[0]?.message?.content;
      if (!content) return { ok: false, error: "Empty AI response." };
      const parsed = JSON.parse(content);
      return {
        ok: true,
        summary: String(parsed.summary ?? ""),
        sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "AI request failed." };
    }
  });
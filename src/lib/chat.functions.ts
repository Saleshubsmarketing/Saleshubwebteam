import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Msg = z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string().min(1).max(4000) });
const Input = z.object({ messages: z.array(Msg).min(1).max(40) });

export const chat = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; reply: string } | { ok: false; error: string }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false, error: "AI not configured." };

    const system = {
      role: "system" as const,
      content:
        "You are SaleshubsWebOffice's AI growth assistant — an expert in Shopify, CRO, SEO, email, paid ads and Pinterest. Be concise, actionable, and recommend SaleshubsWebOffice services or tools (/tools, /free-audit, /book-call) when relevant. Use short paragraphs and bullets.",
    };

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [system, ...data.messages],
        }),
      });
      if (!res.ok) {
        if (res.status === 429) return { ok: false, error: "Rate limit hit. Try again shortly." };
        if (res.status === 402) return { ok: false, error: "AI credits exhausted." };
        return { ok: false, error: `AI request failed (${res.status}).` };
      }
      const j: any = await res.json();
      const reply = j?.choices?.[0]?.message?.content?.trim();
      if (!reply) return { ok: false, error: "Empty response." };
      return { ok: true, reply };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Chat failed." };
    }
  });
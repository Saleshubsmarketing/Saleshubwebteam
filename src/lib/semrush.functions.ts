import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://connector-gateway.lovable.dev/semrush";

const InputSchema = z.object({
  domain: z.string().trim().min(3).max(255),
  database: z.string().trim().min(2).max(5).default("us"),
});

function cleanDomain(input: string) {
  return input.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

// Parse Semrush JSON response: { data: { columnNames: [...], rows: [[...]] } }
function rowToObject(data: any): Record<string, string> | null {
  const cols: string[] | undefined = data?.data?.columnNames;
  const row: string[] | undefined = data?.data?.rows?.[0];
  if (!cols || !row) return null;
  const obj: Record<string, string> = {};
  cols.forEach((c, i) => (obj[c] = row[i]));
  return obj;
}

async function gatewayGet(path: string, params: Record<string, string>) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  if (!SEMRUSH_API_KEY) throw new Error("SEMRUSH_API_KEY missing");

  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GATEWAY}/${path}?${qs}`, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": SEMRUSH_API_KEY,
    },
  });
  const text = await res.text();
  let body: any = null;
  try { body = JSON.parse(text); } catch { /* ignore */ }
  if (!res.ok) {
    const msg = body?.error || body?.message || text.slice(0, 200);
    throw new Error(`Semrush ${path} [${res.status}]: ${msg}`);
  }
  if (body?.error) throw new Error(`Semrush ${path}: ${body.error}`);
  return body;
}

export const semrushDomainSnapshot = createServerFn({ method: "POST" })
  .inputValidator((d) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const domain = cleanDomain(data.domain);
    if (!domain || !domain.includes(".")) {
      return { ok: false as const, error: "Enter a valid domain (e.g. allbirds.com)." };
    }

    try {
      const [ranksRaw, backlinksRaw] = await Promise.all([
        gatewayGet("domains/domain_ranks", {
          domain,
          database: data.database,
          export_columns: "Dn,Rk,Or,Ot,Oc,Ad,At,Ac",
        }),
        gatewayGet("backlinks/backlinks_overview", {
          target: domain,
          target_type: "root_domain",
          export_columns: "ascore,total,domains_num,urls_num,ips_num,follows_num,nofollows_num",
        }),
      ]);

      const ranks = rowToObject(ranksRaw) ?? {};
      const back = rowToObject(backlinksRaw) ?? {};

      const num = (v: string | undefined) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };

      return {
        ok: true as const,
        domain,
        database: data.database,
        organicKeywords: num(ranks.Or),
        organicTraffic: num(ranks.Ot),
        organicCost: num(ranks.Oc),
        paidKeywords: num(ranks.Ad),
        paidTraffic: num(ranks.At),
        rank: num(ranks.Rk),
        backlinks: num(back.total),
        refDomains: num(back.domains_num),
        followLinks: num(back.follows_num),
        nofollowLinks: num(back.nofollows_num),
        authority: num(back.ascore),
      };
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (/TOTAL LIMIT EXCEEDED|quota/i.test(msg)) {
        return { ok: false as const, error: "Semrush API quota exhausted. Upgrade your plan or wait for reset." };
      }
      console.error("semrushDomainSnapshot failed", msg);
      return { ok: false as const, error: "Semrush request failed. Please try again." };
    }
  });
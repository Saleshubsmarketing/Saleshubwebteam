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

/* -------- Real signal collection -------- */

type FetchProbe = {
  ok: boolean;
  status: number;
  finalUrl: string;
  ttfbMs: number;
  totalMs: number;
  bytes: number;
  contentType: string;
  headers: Record<string, string>;
  html: string;
  error?: string;
};

async function probeUrl(url: string, timeoutMs = 12000): Promise<FetchProbe> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NovaCommerceAuditBot/1.0; +https://novacommerce.ai/bot)",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const ttfb = Date.now() - t0;
    const text = await res.text();
    const total = Date.now() - t0;
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => (headers[k] = v));
    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url || url,
      ttfbMs: ttfb,
      totalMs: total,
      bytes: new TextEncoder().encode(text).length,
      contentType: res.headers.get("content-type") ?? "",
      headers,
      html: text.slice(0, 250_000),
    };
  } catch (e: any) {
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      ttfbMs: 0,
      totalMs: Date.now() - t0,
      bytes: 0,
      contentType: "",
      headers: {},
      html: "",
      error: e?.name === "AbortError" ? "timeout" : String(e?.message ?? e),
    };
  } finally {
    clearTimeout(timer);
  }
}

function pick(re: RegExp, html: string): string | null {
  const m = html.match(re);
  return m ? (m[1] ?? "").trim() : null;
}
function pickAll(re: RegExp, html: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) out.push((m[1] ?? "").trim());
  return out;
}

function extractSignals(probe: FetchProbe, baseUrl: string) {
  const html = probe.html;
  const lower = html.toLowerCase();
  const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i, html);
  const metaDesc = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i, html);
  const ogTitle = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i, html);
  const ogImage = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i, html);
  const viewport = pick(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i, html);
  const canonical = pick(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i, html);
  const robotsMeta = pick(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i, html);
  const lang = pick(/<html[^>]+lang=["']([^"']+)["']/i, html);
  const h1s = pickAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, html).map((s) => s.replace(/<[^>]+>/g, "").trim()).filter(Boolean);
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const imgs = pickAll(/<img\b[^>]*>/gi, html.replace(/<img/gi, "<img\u0001")).length || (html.match(/<img\b/gi) || []).length;
  const imgsMissingAlt = (html.match(/<img\b(?![^>]*\balt=)[^>]*>/gi) || []).length;
  const scripts = (html.match(/<script\b/gi) || []).length;
  const stylesheets = (html.match(/<link\b[^>]+rel=["']stylesheet["'][^>]*>/gi) || []).length;
  const inlineStyles = (html.match(/<style\b/gi) || []).length;
  const hasViewport = !!viewport;
  const hasJsonLd = /application\/ld\+json/i.test(html);
  const hasOg = !!(ogTitle || ogImage);
  const isShopify = /cdn\.shopify\.com|shopify\.com|x-shopid|shopify_stats/i.test(lower) || /\bshopify\b/i.test(probe.headers["server"] ?? "");
  const hasGTM = /googletagmanager\.com\/gtm\.js|gtag\(/i.test(html);
  const hasMetaPixel = /connect\.facebook\.net|fbq\(/i.test(html);
  const hasKlaviyo = /klaviyo\.com|_learnq/i.test(html);

  // Collect internal links for broken-link sampling
  const anchors = pickAll(/<a\b[^>]+href=["']([^"'#]+)["'][^>]*>/gi, html);
  const base = new URL(baseUrl);
  const internal = Array.from(
    new Set(
      anchors
        .map((href) => {
          try {
            const u = new URL(href, base);
            return u.host === base.host ? u.toString().split("#")[0] : null;
          } catch {
            return null;
          }
        })
        .filter((u): u is string => !!u && u !== probe.finalUrl),
    ),
  ).slice(0, 8);

  return {
    title,
    titleLen: title?.length ?? 0,
    metaDesc,
    metaDescLen: metaDesc?.length ?? 0,
    ogTitle,
    ogImage,
    viewport,
    canonical,
    robotsMeta,
    lang,
    h1Count: h1s.length,
    h1Sample: h1s.slice(0, 3),
    h2Count,
    imgs,
    imgsMissingAlt,
    scripts,
    stylesheets,
    inlineStyles,
    hasViewport,
    hasJsonLd,
    hasOg,
    isShopify,
    hasGTM,
    hasMetaPixel,
    hasKlaviyo,
    internalLinks: internal,
  };
}

async function checkLinks(urls: string[]): Promise<{ url: string; status: number; ok: boolean }[]> {
  const results = await Promise.all(
    urls.map(async (u) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      try {
        const r = await fetch(u, { method: "HEAD", redirect: "follow", signal: ctrl.signal });
        if (r.status === 405 || r.status === 403) {
          // some servers block HEAD; retry GET
          const r2 = await fetch(u, { method: "GET", redirect: "follow", signal: ctrl.signal });
          return { url: u, status: r2.status, ok: r2.ok };
        }
        return { url: u, status: r.status, ok: r.ok };
      } catch (e: any) {
        return { url: u, status: 0, ok: false };
      } finally {
        clearTimeout(t);
      }
    }),
  );
  return results;
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

    /* 1. Fetch the page. Detect dead domains, DNS errors, 4xx/5xx. */
    const probe = await probeUrl(url);
    if (probe.error === "timeout") {
      return { ok: false as const, error: `Could not reach ${url} — request timed out after 12s. The site appears to be down or blocking requests.` };
    }
    if (probe.status === 0) {
      return { ok: false as const, error: `Could not reach ${url}. The domain is unreachable (DNS error or network failure): ${probe.error ?? "unknown"}.` };
    }
    if (probe.status >= 400) {
      return { ok: false as const, error: `${url} returned HTTP ${probe.status}. The page is not serving content — cannot audit.` };
    }
    if (!/text\/html/i.test(probe.contentType)) {
      return { ok: false as const, error: `${url} returned ${probe.contentType || "non-HTML content"} — only HTML pages can be audited.` };
    }
    if (probe.html.length < 200) {
      return { ok: false as const, error: `${url} returned a near-empty response (${probe.html.length} bytes). The page may require JavaScript or is misconfigured.` };
    }

    /* 1b. Detect parked / placeholder / soft-404 pages that return HTTP 200 but contain no real content. */
    const htmlLower = probe.html.toLowerCase();
    const textOnly = probe.html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const wordCount = textOnly ? textOnly.split(" ").length : 0;

    const parkedSignals = [
      "domain is for sale",
      "buy this domain",
      "this domain is for sale",
      "domain for sale",
      "parked free",
      "parked by",
      "godaddy.com/domains",
      "sedoparking",
      "hugedomains",
      "dan.com",
      "afternic",
      "namecheap parking",
      "future home of",
      "default web site page",
      "apache2 ubuntu default page",
      "welcome to nginx",
      "it works!",
      "index of /",
    ];
    const softErrorSignals = [
      "404 not found",
      "page not found",
      "site not found",
      "this site can",
      "no such host",
      "under construction",
      "coming soon",
      "account suspended",
      "site temporarily unavailable",
      "service unavailable",
      "bad gateway",
    ];

    const matchedParked = parkedSignals.find((s) => htmlLower.includes(s));
    if (matchedParked) {
      return {
        ok: false as const,
        error: `${probe.finalUrl} appears to be a parked or placeholder domain (matched: "${matchedParked}"). There is no real site to audit.`,
      };
    }

    const matchedSoftError = softErrorSignals.find((s) => htmlLower.includes(s));
    // Only treat as soft-404 if the page is also thin (parked/error pages are usually tiny).
    if (matchedSoftError && wordCount < 80) {
      return {
        ok: false as const,
        error: `${probe.finalUrl} looks like an error or placeholder page (matched: "${matchedSoftError}", only ${wordCount} words of content). Nothing real to audit.`,
      };
    }

    if (wordCount < 40) {
      return {
        ok: false as const,
        error: `${probe.finalUrl} returned only ${wordCount} words of visible content. The page is empty, JS-rendered without SSR, or misconfigured — cannot run a meaningful audit.`,
      };
    }

    /* 2. Extract real on-page signals. */
    const signals = extractSignals(probe, probe.finalUrl);

    /* 3. Sample internal links for broken-link detection. */
    const linkChecks = signals.internalLinks.length
      ? await checkLinks(signals.internalLinks)
      : [];
    const brokenLinks = linkChecks.filter((l) => !l.ok);

    /* 4. Build a grounded fact sheet for the AI. */
    const facts = {
      url: probe.finalUrl,
      httpStatus: probe.status,
      ttfbMs: probe.ttfbMs,
      totalLoadMs: probe.totalMs,
      pageBytes: probe.bytes,
      visibleWordCount: wordCount,
      contentType: probe.contentType,
      server: probe.headers["server"] ?? null,
      hsts: !!probe.headers["strict-transport-security"],
      xFrameOptions: probe.headers["x-frame-options"] ?? null,
      contentSecurityPolicy: !!probe.headers["content-security-policy"],
      cacheControl: probe.headers["cache-control"] ?? null,
      compression: probe.headers["content-encoding"] ?? null,
      ...signals,
      sampledLinks: linkChecks,
      brokenLinkCount: brokenLinks.length,
    };

    const system = [
      "You are NovaCommerce — an elite eCommerce growth agency's senior auditor.",
      "You are given REAL, measured signals collected from the target page (HTTP status, response time, page weight, parsed meta tags, headings, image alt coverage, script/stylesheet counts, detected tech, broken-link sample, security headers).",
      "Ground EVERY finding in the supplied facts. Quote specific numbers (e.g. 'TTFB 2,140 ms', 'meta description missing', '12 of 38 images lack alt', '3 broken internal links').",
      "Never invent data not present in the facts. If a signal is unavailable, say so — do not guess.",
      "Be honest and discriminating. Scores must reflect the evidence: e.g. TTFB > 1500ms or page > 3MB should drop Performance below 60; missing meta description / H1 / canonical drops SEO sharply; broken links drop UX; missing viewport drops Mobile severely; missing image alts drops Accessibility.",
      "Most stores score 45-75. Reserve 85+ for genuinely excellent signals. Sites with broken links, missing meta, or slow TTFB should NOT score above 70 in those categories.",
      "HARD RULES: If visibleWordCount < 150, OR title is missing/empty, OR h1Count == 0, OR there are fewer than 3 internal links, the site is essentially empty — every score MUST be below 35 and the summary must say the site has no real content. Do NOT be polite about an empty site.",
      "If imgs == 0 AND scripts < 3 AND stylesheets < 2, treat as a static placeholder — Performance/SEO/Conversion all below 40.",
      "Cover: Performance, SEO, Mobile, UX, Conversion (CRO), Accessibility, and Broken Links.",
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
            {
              role: "user",
              content:
                `Audit this website using ONLY the measured signals below.\n\nURL: ${probe.finalUrl}\n\nMEASURED SIGNALS (JSON):\n` +
                JSON.stringify(facts, null, 2),
            },
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
      return { ok: true as const, url: probe.finalUrl, audit: parsed, facts };
    } catch {
      return { ok: false as const, error: "Failed to parse audit." };
    }
  });
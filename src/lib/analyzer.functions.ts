import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  url: z.string().trim().min(4).max(2048),
});

function normalizeUrl(input: string): string | null {
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    if (!parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/* -------- Real page probe (URL validation, SSL, reachability) -------- */

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
  sslError?: boolean;
  error?: string;
};

async function probeUrl(url: string, timeoutMs = 15000): Promise<FetchProbe> {
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
      html: text.slice(0, 300_000),
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const name = e instanceof Error ? e.name : "";
    const sslError = /certificate|ssl|tls|self.signed|cert_/i.test(msg);
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
      sslError,
      error: name === "AbortError" ? "timeout" : msg,
    };
  } finally {
    clearTimeout(timer);
  }
}

/* -------- On-page SEO signal extraction (real DOM-level checks) -------- */

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

function extractSeoSignals(html: string, baseUrl: string) {
  const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i, html);
  const metaDesc = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i, html);
  const viewport = pick(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i, html);
  const canonical = pick(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i, html);
  const robotsMeta = pick(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i, html);
  const lang = pick(/<html[^>]+lang=["']([^"']+)["']/i, html);
  const ogTitle = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i, html);
  const ogImage = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i, html);
  const twitterCard = pick(/<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']*)["']/i, html);
  const h1s = pickAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, html)
    .map((s) => s.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const imgs = (html.match(/<img\b/gi) || []).length;
  const imgsMissingAlt = (html.match(/<img\b(?![^>]*\balt=)[^>]*>/gi) || []).length;
  const hasJsonLd = /application\/ld\+json/i.test(html);
  const anchors = pickAll(/<a\b[^>]+href=["']([^"'#]+)["'][^>]*>/gi, html);
  let internal: string[] = [];
  try {
    const base = new URL(baseUrl);
    internal = Array.from(
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
          .filter((u): u is string => !!u),
      ),
    ).slice(0, 10);
  } catch {
    /* noop */
  }
  return {
    title,
    titleLen: title?.length ?? 0,
    metaDesc,
    metaDescLen: metaDesc?.length ?? 0,
    viewport,
    canonical,
    robotsMeta,
    lang,
    ogTitle,
    ogImage,
    twitterCard,
    h1Count: h1s.length,
    h1Sample: h1s.slice(0, 3),
    h2Count,
    imgs,
    imgsMissingAlt,
    hasJsonLd,
    internalLinks: internal,
  };
}

async function checkUrlStatus(url: string, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctrl.signal });
    if (r.status === 405 || r.status === 403) {
      r = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal });
    }
    return { url, status: r.status, ok: r.ok };
  } catch {
    return { url, status: 0, ok: false };
  } finally {
    clearTimeout(t);
  }
}

type PageSignals = {
  buttons: number;
  forms: number;
  inputs: number;
  wordCount: number;
  hasCompression: boolean;
  hasCacheHints: boolean;
  hasHttps: boolean;
};

function stripMarkup(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPageSignals(html: string, finalUrl: string, headers: Record<string, string>): PageSignals {
  const text = stripMarkup(html);
  return {
    buttons: (html.match(/<button\b/gi) || []).length,
    forms: (html.match(/<form\b/gi) || []).length,
    inputs: (html.match(/<(input|textarea|select)\b/gi) || []).length,
    wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0,
    hasCompression: /\b(br|gzip|deflate)\b/i.test(headers["content-encoding"] ?? ""),
    hasCacheHints: /(max-age|s-maxage|public|stale-while-revalidate)/i.test(headers["cache-control"] ?? ""),
    hasHttps: /^https:/i.test(finalUrl),
  };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function computeLiveScores(
  probe: FetchProbe,
  seo: ReturnType<typeof extractSeoSignals>,
  page: PageSignals,
  brokenCount: number,
  robots: { ok: boolean; status: number },
  sitemap: { ok: boolean; status: number },
) {
  const performance = clampScore(
    100
      - Math.max(0, Math.round((probe.ttfbMs - 600) / 30))
      - Math.max(0, Math.round((probe.totalMs - 1800) / 50))
      - Math.max(0, Math.round((probe.bytes - 300_000) / 60_000))
      - (page.hasCompression ? 0 : 10)
      - (page.hasCacheHints ? 0 : 6),
  );

  const seoScore = clampScore(
    100
      - (!seo.title ? 18 : 0)
      - (seo.title && (seo.titleLen < 20 || seo.titleLen > 65) ? 6 : 0)
      - (!seo.metaDesc ? 18 : 0)
      - (seo.metaDesc && (seo.metaDescLen < 70 || seo.metaDescLen > 165) ? 6 : 0)
      - (seo.h1Count === 0 ? 16 : seo.h1Count > 1 ? 8 : 0)
      - (!seo.canonical ? 8 : 0)
      - (!seo.viewport ? 14 : 0)
      - (!seo.lang ? 6 : 0)
      - (!seo.hasJsonLd ? 4 : 0)
      - (!seo.ogTitle && !seo.ogImage ? 4 : 0)
      - (!robots.ok ? 6 : 0)
      - (!sitemap.ok ? 6 : 0),
  );

  const altPenalty = seo.imgs > 0 ? Math.round((seo.imgsMissingAlt / seo.imgs) * 40) : 0;
  const accessibility = clampScore(
    100 - (!seo.lang ? 10 : 0) - (!seo.viewport ? 15 : 0) - (seo.h1Count !== 1 ? 10 : 0) - altPenalty,
  );

  const mobile = clampScore(
    performance * 0.65 + accessibility * 0.15 + (seo.viewport ? 20 : 0) - (probe.bytes > 1_500_000 ? 10 : 0),
  );

  const ux = clampScore(
    performance * 0.4 + accessibility * 0.25 + seoScore * 0.2 + Math.max(0, 15 - brokenCount * 5),
  );

  const conversion = clampScore(
    60 + (page.forms > 0 ? 12 : 0) + Math.min(page.buttons, 4) * 4 + (seo.metaDesc ? 6 : 0) + (page.hasHttps ? 6 : 0)
      + (brokenCount === 0 ? 8 : -brokenCount * 6) + (page.wordCount < 150 ? -10 : 0) + (performance >= 70 ? 6 : performance < 50 ? -10 : 0),
  );

  return {
    performance,
    seo: seoScore,
    mobile,
    ux,
    conversion,
    accessibility,
  };
}

/* -------- Google PageSpeed Insights (real Lighthouse) -------- */

type PsiStrategy = "mobile" | "desktop";
type PsiAudit = {
  id: string;
  title: string;
  description?: string;
  score: number | null;
  displayValue?: string;
};
type PsiResult = {
  strategy: PsiStrategy;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    fcp: string | null;
    lcp: string | null;
    cls: string | null;
    tbt: string | null;
    si: string | null;
    tti: string | null;
  };
  opportunities: PsiAudit[];
  diagnostics: PsiAudit[];
  failedAccessibility: PsiAudit[];
  failedSeo: PsiAudit[];
  failedBestPractices: PsiAudit[];
};

async function runPsi(url: string, strategy: PsiStrategy): Promise<PsiResult | { error: string }> {
  const baseParams = new URLSearchParams({
    url,
    strategy,
    category: "performance",
  });
  const extraCats = ["accessibility", "best-practices", "seo"];
  let baseQs = baseParams.toString();
  for (const c of extraCats) baseQs += `&category=${encodeURIComponent(c)}`;

  const parseResponse = async (data: any): Promise<PsiResult | { error: string }> => {
    const lh = data?.lighthouseResult;
    if (!lh) return { error: "PageSpeed returned no Lighthouse result." };
    const cats = lh.categories ?? {};
    const audits = lh.audits ?? {};
    const pct = (s: any) =>
      typeof s?.score === "number" ? Math.round(s.score * 100) : 0;
    const toAudit = (id: string): PsiAudit | null => {
      const a = audits[id];
      if (!a) return null;
      return {
        id,
        title: a.title,
        description: a.description,
        score: typeof a.score === "number" ? a.score : null,
        displayValue: a.displayValue,
      };
    };
    const refs = (catKey: string) => (cats[catKey]?.auditRefs ?? []) as Array<{ id: string; group?: string }>;
    const perfRefs = refs("performance");
    const opportunities = perfRefs
      .filter((r) => r.group === "load-opportunities")
      .map((r) => toAudit(r.id))
      .filter((a): a is PsiAudit => !!a && a.score !== null && a.score < 0.9)
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 8);
    const diagnostics = perfRefs
      .filter((r) => r.group === "diagnostics")
      .map((r) => toAudit(r.id))
      .filter((a): a is PsiAudit => !!a && a.score !== null && a.score < 0.9)
      .slice(0, 6);
    const failedFrom = (catKey: string) =>
      refs(catKey)
        .map((r) => toAudit(r.id))
        .filter((a): a is PsiAudit => !!a && a.score !== null && a.score < 0.9)
        .slice(0, 8);

    return {
      strategy,
      scores: {
        performance: pct(cats.performance),
        accessibility: pct(cats.accessibility),
        bestPractices: pct(cats["best-practices"]),
        seo: pct(cats.seo),
      },
      metrics: {
        fcp: audits["first-contentful-paint"]?.displayValue ?? null,
        lcp: audits["largest-contentful-paint"]?.displayValue ?? null,
        cls: audits["cumulative-layout-shift"]?.displayValue ?? null,
        tbt: audits["total-blocking-time"]?.displayValue ?? null,
        si: audits["speed-index"]?.displayValue ?? null,
        tti: audits["interactive"]?.displayValue ?? null,
      },
      opportunities,
      diagnostics,
      failedAccessibility: failedFrom("accessibility"),
      failedSeo: failedFrom("seo"),
      failedBestPractices: failedFrom("best-practices"),
    };
  };

  const key = process.env.PAGESPEED_API_KEY?.trim();
  const attempts = [key ? `${baseQs}&key=${encodeURIComponent(key)}` : null, baseQs].filter(
    (value, index, arr): value is string => !!value && arr.indexOf(value) === index,
  );

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 90_000);
  try {
    let lastError = "PageSpeed request failed.";
    for (const query of attempts) {
      const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${query}`;
      const res = await fetch(endpoint, { signal: ctrl.signal });
      if (res.ok) {
        const data = (await res.json()) as any;
        return parseResponse(data);
      }

      const body = await res.text().catch(() => "");
      const normalized = body.slice(0, 400);
      if (res.status === 403 && /has not been used|disabled|API key not valid/i.test(normalized)) {
        lastError = `PageSpeed API key rejected (${res.status}).`;
        continue;
      }
      if (res.status === 429) {
        lastError = "Google PageSpeed rate limit reached. Try again in a minute.";
        continue;
      }
      return { error: `PageSpeed API ${res.status}: ${normalized.slice(0, 200)}` };
    }
    return { error: lastError };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: /AbortError/i.test(msg) ? "PageSpeed timed out (90s)." : msg };
  } finally {
    clearTimeout(timer);
  }
}

/* -------- Build findings & recommendations from REAL data -------- */

type Severity = "critical" | "warning" | "info";
type Finding = { severity: Severity; title: string; detail: string; impact: string };
type Category = { name: string; findings: Finding[] };
type Recommendation = {
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
  effort: "low" | "medium" | "high";
};

function sevFromScore(score: number): Severity {
  if (score < 50) return "critical";
  if (score < 90) return "warning";
  return "info";
}

function buildSeoFindings(seo: ReturnType<typeof extractSeoSignals>, robots: { ok: boolean; status: number }, sitemap: { ok: boolean; status: number }): Finding[] {
  const out: Finding[] = [];
  if (!seo.title) {
    out.push({ severity: "critical", title: "Missing <title> tag", detail: "The page has no <title> element.", impact: "Search engines have no headline to show in results — major ranking and CTR loss." });
  } else if (seo.titleLen < 20 || seo.titleLen > 65) {
    out.push({ severity: "warning", title: `Title length is ${seo.titleLen} chars`, detail: `"${seo.title}". Optimal is 30–60 characters.`, impact: "Title may be truncated or look thin in SERPs." });
  } else {
    out.push({ severity: "info", title: "Title tag present", detail: `"${seo.title}" (${seo.titleLen} chars).`, impact: "Good — within optimal length." });
  }
  if (!seo.metaDesc) {
    out.push({ severity: "critical", title: "Missing meta description", detail: "No <meta name=\"description\"> found.", impact: "Google will auto-generate a snippet — lower CTR." });
  } else if (seo.metaDescLen < 70 || seo.metaDescLen > 165) {
    out.push({ severity: "warning", title: `Meta description is ${seo.metaDescLen} chars`, detail: "Optimal is 120–160 characters.", impact: "Snippet may be truncated or under-utilized." });
  }
  if (seo.h1Count === 0) out.push({ severity: "critical", title: "No <h1> on the page", detail: "Every page should have exactly one H1.", impact: "Hurts topical clarity for search engines and screen readers." });
  else if (seo.h1Count > 1) out.push({ severity: "warning", title: `${seo.h1Count} <h1> tags found`, detail: "Multiple H1s dilute the page's main topic.", impact: "Reduces SEO clarity." });
  if (!seo.canonical) out.push({ severity: "warning", title: "No canonical tag", detail: "No <link rel=\"canonical\"> declared.", impact: "Risk of duplicate-content issues across URL variants." });
  if (!seo.viewport) out.push({ severity: "critical", title: "Missing viewport meta", detail: "No <meta name=\"viewport\"> tag.", impact: "Page will not render correctly on mobile devices." });
  if (!seo.lang) out.push({ severity: "warning", title: "No <html lang> attribute", detail: "Language is not declared on the root <html> element.", impact: "Hurts accessibility and international SEO." });
  if (!seo.hasJsonLd) out.push({ severity: "info", title: "No JSON-LD structured data", detail: "No schema.org markup detected.", impact: "Missing rich-result eligibility." });
  if (!seo.ogTitle && !seo.ogImage) out.push({ severity: "warning", title: "No Open Graph tags", detail: "Shared links won't render a rich preview.", impact: "Lower social-share CTR." });
  if (!seo.twitterCard) out.push({ severity: "info", title: "No Twitter Card meta", detail: "Missing <meta name=\"twitter:card\">.", impact: "Default Twitter previews instead of rich cards." });
  if (!robots.ok) out.push({ severity: "warning", title: `robots.txt returned HTTP ${robots.status || "error"}`, detail: "Search engine crawlers expect /robots.txt.", impact: "Crawl directives are missing or unreachable." });
  else out.push({ severity: "info", title: "robots.txt found", detail: "Reachable at /robots.txt.", impact: "Crawlers can read your directives." });
  if (!sitemap.ok) out.push({ severity: "warning", title: `sitemap.xml returned HTTP ${sitemap.status || "error"}`, detail: "No sitemap detected at /sitemap.xml.", impact: "Slower discovery of new pages by search engines." });
  return out;
}

function buildPerfFindings(psi: PsiResult, probeMs: number, bytes: number): Finding[] {
  const out: Finding[] = [];
  out.push({
    severity: sevFromScore(psi.scores.performance),
    title: `Lighthouse performance score: ${psi.scores.performance}/100`,
    detail: `LCP ${psi.metrics.lcp ?? "?"} · CLS ${psi.metrics.cls ?? "?"} · TBT ${psi.metrics.tbt ?? "?"} · FCP ${psi.metrics.fcp ?? "?"} · SI ${psi.metrics.si ?? "?"}`,
    impact: psi.scores.performance < 50 ? "Critical: poor Core Web Vitals reduce SEO rankings and conversion." : "Faster pages convert better and rank higher.",
  });
  out.push({
    severity: probeMs > 2000 ? "warning" : "info",
    title: `Server TTFB sample: ${probeMs} ms`,
    detail: `Total response measured at ${probeMs} ms · ${Math.round(bytes / 1024)} KB transferred.`,
    impact: probeMs > 2000 ? "Slow server response delays everything downstream." : "Server response is healthy.",
  });
  for (const o of psi.opportunities.slice(0, 4)) {
    out.push({
      severity: (o.score ?? 1) < 0.5 ? "critical" : "warning",
      title: o.title,
      detail: (o.displayValue ? `${o.displayValue} · ` : "") + (o.description?.replace(/\[.*?\]\(.*?\)/g, "").slice(0, 220) ?? ""),
      impact: "Reduces load time when fixed.",
    });
  }
  return out;
}

function buildBrokenLinkFindings(checks: { url: string; status: number; ok: boolean }[]): Finding[] {
  const broken = checks.filter((c) => !c.ok);
  if (broken.length === 0)
    return [{ severity: "info", title: "No broken links in sample", detail: `Checked ${checks.length} internal links — all OK.`, impact: "Healthy link graph." }];
  return broken.slice(0, 6).map((b) => ({
    severity: "critical" as const,
    title: `Broken link: HTTP ${b.status || "unreachable"}`,
    detail: b.url,
    impact: "Hurts UX, SEO crawl budget, and conversion.",
  }));
}

function buildRecommendations(
  psi: PsiResult,
  seo: ReturnType<typeof extractSeoSignals>,
  broken: number,
): Recommendation[] {
  const recs: Recommendation[] = [];
  if (!seo.title || seo.titleLen < 20 || seo.titleLen > 65)
    recs.push({ priority: "high", title: "Fix the <title> tag", detail: "Write a unique 30–60 char title with the primary keyword near the front.", effort: "low" });
  if (!seo.metaDesc)
    recs.push({ priority: "high", title: "Add a meta description", detail: "Write a compelling 120–160 char description that drives clicks from search.", effort: "low" });
  if (!seo.viewport)
    recs.push({ priority: "high", title: "Add a viewport meta tag", detail: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> for mobile.", effort: "low" });
  if (seo.h1Count !== 1)
    recs.push({ priority: "medium", title: "Use exactly one H1", detail: `Page currently has ${seo.h1Count} H1 tags. Pick the single most important headline.`, effort: "low" });
  if (!seo.canonical)
    recs.push({ priority: "medium", title: "Add a canonical tag", detail: "Prevent duplicate-content penalties across URL variants.", effort: "low" });
  if (broken > 0)
    recs.push({ priority: "high", title: `Fix ${broken} broken internal link${broken === 1 ? "" : "s"}`, detail: "Repair or remove dead links to recover lost authority and trust.", effort: "low" });
  for (const o of psi.opportunities.slice(0, 4)) {
    recs.push({
      priority: (o.score ?? 1) < 0.5 ? "high" : "medium",
      title: o.title,
      detail: (o.displayValue ? `${o.displayValue}. ` : "") + "From Google Lighthouse opportunities.",
      effort: "medium",
    });
  }
  if (psi.scores.accessibility < 90)
    recs.push({ priority: psi.scores.accessibility < 60 ? "high" : "medium", title: `Improve accessibility (${psi.scores.accessibility}/100)`, detail: "Address Lighthouse accessibility failures — alt text, color contrast, ARIA, labels.", effort: "medium" });
  if (!seo.hasJsonLd)
    recs.push({ priority: "low", title: "Add structured data (JSON-LD)", detail: "Mark up Product, Organization, BreadcrumbList for rich results.", effort: "medium" });
  return recs.slice(0, 10);
}

/* -------- Public server function -------- */

export const analyzeWebsite = createServerFn({ method: "POST" })
  .inputValidator((d) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const url = normalizeUrl(data.url);
    if (!url) return { ok: false as const, error: "Invalid website URL." };

    // 1. Validate reachability + SSL + content type
    const probe = await probeUrl(url);
    if (probe.sslError)
      return { ok: false as const, error: `SSL certificate issue on ${url} — ${probe.error}` };
    if (probe.error === "timeout")
      return { ok: false as const, error: `Website timeout detected — ${url} did not respond within 15s.` };
    if (probe.status === 0)
      return { ok: false as const, error: `Website unreachable — DNS or network error for ${url}: ${probe.error ?? "unknown"}.` };
    if (probe.status >= 400)
      return { ok: false as const, error: `${url} returned HTTP ${probe.status} — page not serving content.` };
    if (!/text\/html/i.test(probe.contentType))
      return { ok: false as const, error: `${url} returned ${probe.contentType || "non-HTML content"} — only HTML pages can be audited.` };
    if (probe.html.length < 200)
      return { ok: false as const, error: `${url} returned a near-empty response (${probe.html.length} bytes).` };
    if (/domain for sale|parked free|coming soon|placeholder|this domain is for sale/i.test(probe.html)) {
      return { ok: false as const, error: `${url} is not a live website yet — it appears parked, placeholder, or coming soon.` };
    }

    // 2. Real on-page SEO signals
    const seo = extractSeoSignals(probe.html, probe.finalUrl);
    const page = extractPageSignals(probe.html, probe.finalUrl, probe.headers);

    // 3. Real Lighthouse audit via Google PageSpeed Insights + robots/sitemap + broken-link sample (parallel)
    const origin = new URL(probe.finalUrl).origin;
    const [psiMobile, psiDesktop, robots, sitemap, linkChecks] = await Promise.all([
      runPsi(probe.finalUrl, "mobile"),
      runPsi(probe.finalUrl, "desktop"),
      checkUrlStatus(`${origin}/robots.txt`),
      checkUrlStatus(`${origin}/sitemap.xml`),
      seo.internalLinks.length ? Promise.all(seo.internalLinks.slice(0, 6).map((u) => checkUrlStatus(u))) : Promise.resolve([]),
    ]);

    if ("error" in psiMobile)
      return { ok: false as const, error: `Google PageSpeed Insights failed: ${psiMobile.error}` };

    const desktop = "error" in psiDesktop ? null : psiDesktop;
    const brokenCount = linkChecks.filter((l) => !l.ok).length;
    const liveScores = computeLiveScores(probe, seo, page, brokenCount, robots, sitemap);

    // 4. Build the dashboard from REAL data only
    const audit = {
      summary: `Live scan of ${new URL(probe.finalUrl).hostname}: HTTP ${probe.status}, TTFB ${probe.ttfbMs} ms, total load sample ${probe.totalMs} ms, page weight ${Math.round(probe.bytes / 1024)} KB. Google Lighthouse mobile scored Performance ${psiMobile.scores.performance}/100, SEO ${psiMobile.scores.seo}/100, Accessibility ${psiMobile.scores.accessibility}/100, Best Practices ${psiMobile.scores.bestPractices}/100. ${brokenCount} broken link${brokenCount === 1 ? "" : "s"} found in a sample of ${linkChecks.length}.`,
      scores: {
        performance: liveScores.performance,
        seo: liveScores.seo,
        mobile: liveScores.mobile,
        ux: liveScores.ux,
        conversion: liveScores.conversion,
        accessibility: liveScores.accessibility,
      },
      categories: [
        { name: "Performance" as const, findings: buildPerfFindings(psiMobile, probe.totalMs, probe.bytes) },
        { name: "SEO" as const, findings: buildSeoFindings(seo, robots, sitemap) },
        {
          name: "Accessibility" as const,
          findings: psiMobile.failedAccessibility.length
            ? psiMobile.failedAccessibility.map((a) => ({ severity: sevFromScore((a.score ?? 0) * 100), title: a.title, detail: a.description?.slice(0, 220) ?? "", impact: "Affects users with assistive tech." }))
            : [{ severity: "info" as const, title: "No Lighthouse accessibility failures detected", detail: `Live accessibility score ${liveScores.accessibility}/100.`, impact: "Good baseline." }],
        },
        {
          name: "Mobile" as const,
          findings: [
            { severity: seo.viewport ? "info" : "critical", title: seo.viewport ? "Viewport meta present" : "Missing viewport meta", detail: seo.viewport ?? "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">", impact: seo.viewport ? "Page is mobile-render-ready." : "Page won't scale on mobile devices." },
            { severity: sevFromScore(liveScores.mobile), title: `Mobile readiness score: ${liveScores.mobile}/100`, detail: `Lighthouse ${psiMobile.scores.performance}/100 · LCP ${psiMobile.metrics.lcp ?? "?"} · TBT ${psiMobile.metrics.tbt ?? "?"}`, impact: "Mobile-first indexing makes this the primary signal." },
            ...(desktop ? [{ severity: sevFromScore(desktop.scores.performance), title: `Desktop performance: ${desktop.scores.performance}/100`, detail: `LCP ${desktop.metrics.lcp ?? "?"} · TBT ${desktop.metrics.tbt ?? "?"}`, impact: "Desktop benchmark for comparison." }] : []),
          ],
        },
        { name: "Broken Links" as const, findings: buildBrokenLinkFindings(linkChecks) },
      ],
      recommendations: buildRecommendations(psiMobile, seo, brokenCount),
    };

    return {
      ok: true as const,
      url: probe.finalUrl,
      audit,
      lighthouse: {
        mobile: psiMobile,
        desktop,
      },
      probe: {
        status: probe.status,
        ttfbMs: probe.ttfbMs,
        totalMs: probe.totalMs,
        bytes: probe.bytes,
        server: probe.headers["server"] ?? null,
        hsts: !!probe.headers["strict-transport-security"],
      },
      seoSignals: seo,
    };
  });
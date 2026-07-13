import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://saleshubsweboffice.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/services", changefreq: "monthly", priority: "0.9" },
  { path: "/pricing", changefreq: "monthly", priority: "0.9" },
  { path: "/portfolio", changefreq: "monthly", priority: "0.7" },
  { path: "/case-studies", changefreq: "monthly", priority: "0.7" },
  { path: "/testimonials", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/contact", changefreq: "yearly", priority: "0.6" },
  { path: "/book-call", changefreq: "yearly", priority: "0.7" },
  { path: "/free-audit", changefreq: "monthly", priority: "0.8" },
  { path: "/tools", changefreq: "monthly", priority: "0.9" },
  { path: "/ai-growth-advisor", changefreq: "monthly", priority: "0.8" },
  { path: "/competitor-analyzer", changefreq: "monthly", priority: "0.7" },
  { path: "/conversion-analyzer", changefreq: "monthly", priority: "0.7" },
  { path: "/marketing-health-score", changefreq: "monthly", priority: "0.7" },
  { path: "/revenue-calculator", changefreq: "monthly", priority: "0.7" },
  { path: "/roi-calculator", changefreq: "monthly", priority: "0.7" },
  { path: "/seo-analyzer", changefreq: "monthly", priority: "0.7" },
  { path: "/shopify-grader", changefreq: "monthly", priority: "0.7" },
  { path: "/traffic-checker", changefreq: "monthly", priority: "0.7" },
  { path: "/website-analyzer", changefreq: "monthly", priority: "0.7" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const lastmod = new Date().toISOString().split("T")[0];
        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            `    <lastmod>${lastmod}</lastmod>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
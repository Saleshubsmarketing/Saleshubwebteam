/**
 * SSRF guard: only allow outbound audit fetches to public http(s) hosts.
 * Blocks loopback, private, link-local (cloud metadata), CGNAT and
 * internal-only hostnames, plus non-http(s) schemes.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "instance-data",
  "0.0.0.0",
  "[::]",
  "[::1]",
]);

const BLOCKED_SUFFIXES = [".localhost", ".local", ".internal", ".intranet", ".lan", ".home.arpa"];

function isPrivateIPv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if ([a, Number(m[2]), Number(m[3]), Number(m[4])].some((n) => n > 255)) return true;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 192 && b === 0) return true;
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isPrivateIPv6(hostname: string): boolean {
  const h = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!h.includes(":")) return false;
  if (h === "::" || h === "::1") return true;
  if (/^f[cd][0-9a-f]{2}:/.test(h)) return true; // fc00::/7 unique-local
  if (/^fe[89ab][0-9a-f]:/.test(h)) return true; // fe80::/10 link-local
  // IPv4-mapped, e.g. ::ffff:169.254.169.254
  const v4 = h.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (v4 && isPrivateIPv4(v4[1]!)) return true;
  return false;
}

/** Returns null when safe, otherwise a human-readable reason. */
export function urlBlockReason(input: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return "Invalid URL.";
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "Only http and https URLs can be audited.";
  }
  if (parsed.username || parsed.password) return "URLs with embedded credentials are not allowed.";

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (!hostname) return "Invalid hostname.";
  if (BLOCKED_HOSTNAMES.has(hostname)) return "Internal hosts cannot be audited.";
  if (BLOCKED_SUFFIXES.some((s) => hostname.endsWith(s))) return "Internal hosts cannot be audited.";
  if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
    return "Private or internal IP addresses cannot be audited.";
  }
  // Require a real public domain (IP literals already handled above).
  if (!hostname.includes(".")) return "Enter a full public domain, e.g. example.com.";
  return null;
}

export function isSafePublicUrl(input: string): boolean {
  return urlBlockReason(input) === null;
}

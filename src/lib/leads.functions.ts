import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Validation ----------
const emailZ = z.string().trim().email("Invalid email").max(255).transform((v) => v.toLowerCase());
const nameZ = z.string().trim().min(2, "Name is required").max(120);
const phoneZ = z
  .string()
  .trim()
  .max(40)
  .regex(/^[+()\-\d\s]{6,40}$/, "Invalid phone")
  .optional()
  .or(z.literal(""));
const urlZ = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(v), "Invalid URL")
  .optional()
  .or(z.literal(""));

export const leadInputSchema = z.object({
  form_type: z.enum(["contact", "free_audit", "book_consultation"]),
  full_name: nameZ,
  email: emailZ,
  phone: phoneZ.optional(),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  website: urlZ.optional(),
  requested_service: z.string().trim().max(200).optional().or(z.literal("")),
  budget: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  source_page: z.string().trim().max(300).optional().or(z.literal("")),
  slot: z.string().trim().max(120).optional().or(z.literal("")),
  // Honeypot — must be empty
  hp: z.string().max(0).optional().or(z.literal("")),
  extra: z.record(z.string(), z.any()).optional(),
});
export type LeadInput = z.infer<typeof leadInputSchema>;

function getClientMeta() {
  const req = getRequest();
  const h = req?.headers;
  const ip =
    h?.get("cf-connecting-ip") ||
    h?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h?.get("x-real-ip") ||
    null;
  const ua = h?.get("user-agent") || null;
  return { ip, ua };
}

// ---------- Public: submit ----------
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => leadInputSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.hp && data.hp.length > 0) {
      // Silent success for bots
      return { ok: true as const, id: null };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { ip, ua } = getClientMeta();

    // Rate limit: 5 submissions / IP / 10 min, 3 / email / 10 min
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    if (ip) {
      const { count } = await supabaseAdmin
        .from("lead_submission_log")
        .select("id", { count: "exact", head: true })
        .eq("ip_address", ip)
        .gte("created_at", since);
      if ((count ?? 0) >= 5) {
        return { ok: false as const, error: "Too many submissions. Please try again in a few minutes." };
      }
    }
    const { count: emailCount } = await supabaseAdmin
      .from("lead_submission_log")
      .select("id", { count: "exact", head: true })
      .eq("email", data.email)
      .gte("created_at", since);
    if ((emailCount ?? 0) >= 3) {
      return { ok: false as const, error: "We already received a recent request from this email." };
    }

    // Duplicate suppression: same email + form_type in last 2 min
    const dupeSince = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: dupe } = await supabaseAdmin
      .from("leads")
      .select("id")
      .eq("email", data.email)
      .eq("form_type", data.form_type)
      .gte("created_at", dupeSince)
      .limit(1)
      .maybeSingle();
    if (dupe) {
      return { ok: true as const, id: dupe.id, deduped: true };
    }

    const insert = {
      form_type: data.form_type,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      website: data.website || null,
      requested_service: data.requested_service || null,
      budget: data.budget || null,
      message: data.message || null,
      source_page: data.source_page || null,
      slot: data.slot || null,
      ip_address: ip,
      user_agent: ua,
      extra: data.extra || null,
    };
    const { data: row, error } = await supabaseAdmin
      .from("leads")
      .insert(insert)
      .select("*")
      .single();
    if (error) {
      console.error("[leads] insert error", error);
      return { ok: false as const, error: "Could not save your submission. Please try again." };
    }

    await supabaseAdmin.from("lead_submission_log").insert({ ip_address: ip, email: data.email });

    // Fire-and-forget emails
    try {
      const { sendLeadEmails } = await import("@/lib/leads-email.server");
      await sendLeadEmails(row);
    } catch (e) {
      console.error("[leads] email dispatch failed", e);
    }

    return { ok: true as const, id: row.id };
  });

// ---------- Admin ----------
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin only");
}

export const listLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        search: z.string().trim().max(200).optional(),
        form_type: z.enum(["contact", "free_audit", "book_consultation"]).optional(),
        status: z
          .enum(["new", "contacted", "qualified", "proposal_sent", "won", "lost"])
          .optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        limit: z.number().int().min(1).max(500).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data.form_type) q = q.eq("form_type", data.form_type);
    if (data.status) q = q.eq("status", data.status);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    if (data.search) {
      const s = data.search.replace(/[%,]/g, "");
      q = q.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`);
    }
    q = q.limit(data.limit ?? 200);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "contacted", "qualified", "proposal_sent", "won", "lost"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("leads")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("leads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// First-time bootstrap: promote current signed-in user to admin if no admin exists.
// The self-service "first user becomes admin" bootstrap was removed: it allowed
// any visitor to seize permanent admin access. Admin roles are now granted only
// directly in the database by the project owner.

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { admin: !!data };
  });
import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_leads",
  title: "List leads",
  description:
    "List lead submissions from SaleshubsWebOffice forms. Admins only — RLS filters to the caller's permitted rows.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
    status: z.string().optional().describe("Filter by status (e.g. 'new', 'contacted')."),
    form_type: z.string().optional().describe("Filter by form type (e.g. 'contact', 'free_audit', 'book_call')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status, form_type }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("leads")
      .select("id, created_at, form_type, full_name, email, phone, company, website, requested_service, budget, message, status, source_page")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (status) q = q.eq("status", status);
    if (form_type) q = q.eq("form_type", form_type);
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { leads: data ?? [] },
    };
  },
});
import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listLeads from "./tools/list-leads";
import updateLeadStatus from "./tools/update-lead-status";
import whoami from "./tools/whoami";

// The OAuth issuer must be the direct Supabase host — mcp-js rejects the
// `.lovable.cloud` proxy form on publish (RFC 8414 issuer mismatch).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "saleshubsweboffice-mcp",
  title: "SaleshubsWebOffice MCP",
  version: "0.1.0",
  instructions:
    "Tools for the SaleshubsWebOffice lead management dashboard. Use `whoami` to verify the session, `list_leads` to read lead submissions, and `update_lead_status` to move leads through the pipeline. Access is scoped to the signed-in admin user via Supabase RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoami, listLeads, updateLeadStatus],
});
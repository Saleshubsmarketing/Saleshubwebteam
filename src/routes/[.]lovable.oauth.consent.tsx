import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Loader2, ShieldCheck } from "lucide-react";

// Beta namespace — narrow typed wrapper so we don't fight SDK types.
type OAuthDetails = {
  client?: { name?: string; redirect_uri?: string; client_uri?: string };
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthResult = { redirect_url?: string; redirect_to?: string };
const oauth = () =>
  (supabase.auth as unknown as {
    oauth: {
      getAuthorizationDetails: (id: string) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
      approveAuthorization: (id: string) => Promise<{ data: OAuthResult | null; error: { message: string } | null }>;
      denyAuthorization: (id: string) => Promise<{ data: OAuthResult | null; error: { message: string } | null }>;
    };
  }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data as OAuthDetails;
  },
  component: ConsentPage,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <PageHero
        eyebrow="Authorization"
        title={<>Could not load this request</>}
        subtitle={String((error as Error)?.message ?? error)}
      />
    </SiteLayout>
  ),
});

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "an external app";

  const decide = async (approve: boolean) => {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Authorization request"
        title={<>Connect <span className="text-gradient-brand">{clientName}</span></>}
        subtitle="This lets the external app use SaleshubsWebOffice tools as you. Your account permissions and backend policies still decide what data it can access."
      />
      <section className="pb-24 mx-auto max-w-lg px-4">
        <div className="glass-strong rounded-3xl p-8 space-y-6">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-brand rounded-lg p-2"><ShieldCheck className="w-5 h-5 text-white" /></div>
            <div className="text-sm">
              <p className="font-medium">{clientName} is requesting access</p>
              {details?.client?.redirect_uri && (
                <p className="text-xs text-muted-foreground break-all mt-1">Redirect: {details.client.redirect_uri}</p>
              )}
              {details?.scope && (
                <p className="text-xs text-muted-foreground mt-1">Requested scopes: {details.scope}</p>
              )}
            </div>
          </div>

          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Share your basic profile and email</li>
            <li>• Call this app's enabled MCP tools while you are signed in</li>
            <li>• This does not bypass SaleshubsWebOffice's permissions or backend policies</li>
          </ul>

          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button
              disabled={busy}
              onClick={() => decide(true)}
              className="flex-1 px-5 py-3 rounded-xl bg-gradient-brand text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Approve
            </button>
            <button
              disabled={busy}
              onClick={() => decide(false)}
              className="flex-1 px-5 py-3 rounded-xl glass text-sm font-medium disabled:opacity-60"
            >
              Cancel connection
            </button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
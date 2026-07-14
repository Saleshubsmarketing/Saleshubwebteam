import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { listLeads, updateLeadStatus, deleteLead, claimAdmin, amIAdmin } from "@/lib/leads.functions";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { Loader2, Search, Trash2, Download, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({ meta: [{ title: "Lead Management — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminLeads,
});

type Row = {
  id: string; created_at: string;
  form_type: "contact" | "free_audit" | "book_consultation";
  full_name: string; email: string; phone: string | null; company: string | null;
  website: string | null; requested_service: string | null; budget: string | null;
  message: string | null;
  status: "new" | "contacted" | "qualified" | "proposal_sent" | "won" | "lost";
  source_page: string | null; slot: string | null;
};

const STATUSES = ["new", "contacted", "qualified", "proposal_sent", "won", "lost"] as const;
const FORM_TYPES = [
  { v: "", l: "All forms" },
  { v: "contact", l: "Contact" },
  { v: "free_audit", l: "Free Audit" },
  { v: "book_consultation", l: "Book Consultation" },
];

function AdminLeads() {
  const list = useServerFn(listLeads);
  const update = useServerFn(updateLeadStatus);
  const del = useServerFn(deleteLead);
  const claim = useServerFn(claimAdmin);
  const check = useServerFn(amIAdmin);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [formType, setFormType] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      const res = await list({
        data: {
          search: search || undefined,
          form_type: (formType || undefined) as any,
          status: (status || undefined) as any,
          from: from ? new Date(from).toISOString() : undefined,
          to: to ? new Date(new Date(to).getTime() + 86400000).toISOString() : undefined,
        },
      });
      setRows(res.rows as Row[]);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const r = await check();
      setAdmin(r.admin);
      if (r.admin) reload();
      else setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClaim = async () => {
    try {
      const r = await claim();
      if (r.ok) { toast.success("You are now the admin."); setAdmin(true); reload(); }
      else toast.error("Admin already claimed by another user.");
    } catch (e: any) { toast.error(e?.message ?? "Could not claim admin"); }
  };

  const onExport = () => {
    const cols = ["id","created_at","form_type","full_name","email","phone","company","website","requested_service","budget","message","status","source_page","slot"] as const;
    const esc = (v: any) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lines = [cols.join(",")].concat(rows.map((r) => cols.map((c) => esc((r as any)[c])).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/auth"; };

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    for (const r of rows) t[r.status] = (t[r.status] ?? 0) + 1;
    return t;
  }, [rows]);

  return (
    <SiteLayout>
      <PageHero eyebrow="Admin" title={<>Lead Management</>} subtitle="Every website submission, filtered and searchable." />
      <section className="pb-24 mx-auto max-w-7xl px-4">
        {admin === false ? (
          <div className="glass-strong rounded-3xl p-8 text-center space-y-4">
            <ShieldCheck className="w-10 h-10 text-[var(--brand-cyan)] mx-auto" />
            <h3 className="text-xl font-semibold">You're signed in, but not an admin yet</h3>
            <p className="text-sm text-muted-foreground">
              If you're the first person to sign in, click below to claim admin access. Otherwise ask an existing admin to grant it.
            </p>
            <button onClick={onClaim} className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-medium btn-glow">Claim admin access</button>
            <button onClick={signOut} className="block mx-auto text-xs text-muted-foreground hover:text-foreground">Sign out</button>
          </div>
        ) : (
          <>
            <div className="glass-strong rounded-3xl p-5 space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[220px] flex items-center gap-2 glass rounded-xl px-3">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && reload()} placeholder="Search name or email…" className="flex-1 bg-transparent outline-none text-sm py-2.5" />
                </div>
                <select value={formType} onChange={(e) => setFormType(e.target.value)} className="input-glass max-w-[180px]">
                  {FORM_TYPES.map((f) => (<option key={f.v} value={f.v} className="bg-[#0F172A]">{f.l}</option>))}
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-glass max-w-[180px]">
                  <option value="" className="bg-[#0F172A]">All statuses</option>
                  {STATUSES.map((s) => (<option key={s} value={s} className="bg-[#0F172A]">{s.replace("_"," ")}</option>))}
                </select>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-glass max-w-[160px]" />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-glass max-w-[160px]" />
                <button onClick={reload} className="px-4 py-2 rounded-xl glass hover:bg-white/10 text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Apply</button>
                <button onClick={onExport} className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</button>
                <button onClick={signOut} className="px-4 py-2 rounded-xl glass hover:bg-white/10 text-sm">Sign out</button>
              </div>
              <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
                <span>Total: {rows.length}</span>
                {STATUSES.map((s) => (<span key={s} className="glass px-2 py-1 rounded-md">{s.replace("_"," ")}: {totals[s] ?? 0}</span>))}
              </div>
            </div>

            <div className="mt-6 glass rounded-2xl overflow-hidden">
              {loading ? (
                <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading leads…</div>
              ) : rows.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">No leads match those filters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="text-left px-3 py-2">Date</th>
                        <th className="text-left px-3 py-2">Form</th>
                        <th className="text-left px-3 py-2">Name</th>
                        <th className="text-left px-3 py-2">Email</th>
                        <th className="text-left px-3 py-2">Phone</th>
                        <th className="text-left px-3 py-2">Website</th>
                        <th className="text-left px-3 py-2">Message</th>
                        <th className="text-left px-3 py-2">Status</th>
                        <th className="text-left px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id} className="border-t border-white/5 align-top">
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{r.form_type}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{r.full_name}</td>
                          <td className="px-3 py-2 whitespace-nowrap"><a className="text-[var(--brand-cyan)]" href={`mailto:${r.email}`}>{r.email}</a></td>
                          <td className="px-3 py-2 whitespace-nowrap">{r.phone ?? "—"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{r.website ? (<a href={r.website.startsWith("http") ? r.website : `https://${r.website}`} target="_blank" rel="noreferrer" className="text-[var(--brand-cyan)]">{r.website}</a>) : "—"}</td>
                          <td className="px-3 py-2 max-w-[280px]"><div className="line-clamp-3 text-muted-foreground">{r.message ?? "—"}</div></td>
                          <td className="px-3 py-2">
                            <select value={r.status} onChange={async (e) => {
                              const newStatus = e.target.value as any;
                              setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: newStatus } : x)));
                              try { await update({ data: { id: r.id, status: newStatus } }); toast.success("Status updated"); }
                              catch (err: any) { toast.error(err?.message ?? "Update failed"); }
                            }} className="input-glass py-1 text-xs">
                              {STATUSES.map((s) => (<option key={s} value={s} className="bg-[#0F172A]">{s.replace("_"," ")}</option>))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={async () => {
                              if (!confirm("Delete this lead?")) return;
                              try { await del({ data: { id: r.id } }); setRows((prev) => prev.filter((x) => x.id !== r.id)); toast.success("Deleted"); }
                              catch (err: any) { toast.error(err?.message ?? "Delete failed"); }
                            }} className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Bookmark <Link to="/admin/leads" className="underline">/admin/leads</Link>. Only admins can access.
            </p>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
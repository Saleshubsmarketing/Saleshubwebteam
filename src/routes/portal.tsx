import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { useEffect, useState } from "react";
import { LogIn, LogOut, Plus, ExternalLink, Trash2, Gauge, Search, BarChart3, Sparkles } from "lucide-react";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [
    { title: "Client Portal | SaleshubsWebTeam" },
    { name: "description", content: "Track your stores, audits, growth scores and saved tools in one place." },
  ]}),
  component: Portal,
});

type User = { email: string; name: string };
type Project = { id: string; name: string; url: string; createdAt: number };

const USER_KEY = "shw_user";
const PROJ_KEY = "shw_projects";

function Portal() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      const p = localStorage.getItem(PROJ_KEY);
      if (u) setUser(JSON.parse(u));
      if (p) setProjects(JSON.parse(p));
    } catch {}
  }, []);

  const saveUser = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  };
  const saveProjects = (p: Project[]) => {
    setProjects(p);
    localStorage.setItem(PROJ_KEY, JSON.stringify(p));
  };

  if (!user) return <SignIn onSignIn={saveUser}/>;

  return (
    <SiteLayout>
      <PageHero
        eyebrow={`Welcome back, ${user.name}`}
        title={<>Your <span className="text-gradient-brand">growth cockpit</span>.</>}
        subtitle="Track your stores, run audits and revisit your saved insights."
      />
      <section className="pb-24 mx-auto max-w-7xl px-4 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProjectsCard projects={projects} onChange={saveProjects}/>
          <QuickTools/>
        </div>
        <aside className="space-y-6">
          <div className="glass-strong rounded-2xl p-6">
            <p className="text-xs uppercase text-muted-foreground">Account</p>
            <p className="mt-2 font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <button onClick={() => saveUser(null)} className="mt-4 w-full glass rounded-xl py-2 text-sm flex items-center justify-center gap-2 hover:bg-white/5">
              <LogOut className="w-4 h-4"/> Sign out
            </button>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-sm font-medium">Need hands-on help?</p>
            <p className="text-xs text-muted-foreground mt-1">Book a strategy call with our team.</p>
            <Link to="/book-call" className="mt-4 inline-flex px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm font-medium">Book a call</Link>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

function SignIn({ onSignIn }: { onSignIn: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  return (
    <SiteLayout>
      <PageHero eyebrow="Client Portal" title={<>Sign in to your <span className="text-gradient-brand">growth cockpit</span>.</>} subtitle="Track stores, audits and AI insights — all in one place."/>
      <section className="pb-24 mx-auto max-w-md px-4">
        <form onSubmit={(e) => { e.preventDefault(); if (email.trim() && name.trim()) onSignIn({ email: email.trim(), name: name.trim() }); }} className="glass-strong rounded-3xl p-6 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs uppercase text-muted-foreground">Your name</span>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="glass rounded-xl px-3 py-2 outline-none" placeholder="Jane Doe"/>
          </label>
          <label className="grid gap-1">
            <span className="text-xs uppercase text-muted-foreground">Email</span>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="glass rounded-xl px-3 py-2 outline-none" placeholder="you@store.com"/>
          </label>
          <button className="mt-2 px-4 py-3 rounded-xl bg-gradient-brand text-white font-medium flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4"/> Enter portal
          </button>
          <p className="text-[11px] text-muted-foreground text-center">Stored securely on your device. No password needed for the preview portal.</p>
        </form>
      </section>
    </SiteLayout>
  );
}

function ProjectsCard({ projects, onChange }: { projects: Project[]; onChange: (p: Project[]) => void }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onChange([{ id: crypto.randomUUID(), name: name.trim(), url: url.trim(), createdAt: Date.now() }, ...projects]);
    setName(""); setUrl("");
  };
  const remove = (id: string) => onChange(projects.filter(p => p.id !== id));

  return (
    <div className="glass-strong rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Your stores</p>
          <p className="font-semibold mt-1">{projects.length} tracked</p>
        </div>
      </div>
      <form onSubmit={add} className="mt-4 grid sm:grid-cols-[1fr_1.5fr_auto] gap-2">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Store name" className="glass rounded-xl px-3 py-2 text-sm outline-none"/>
        <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://store.com" className="glass rounded-xl px-3 py-2 text-sm outline-none"/>
        <button className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm flex items-center gap-1"><Plus className="w-4 h-4"/> Add</button>
      </form>
      <div className="mt-5 grid gap-2">
        {projects.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No stores yet. Add one to start tracking audits.</p>}
        {projects.map(p => (
          <div key={p.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground truncate">{p.url}</p>
            </div>
            <a href={p.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/5 rounded-lg" title="Open"><ExternalLink className="w-4 h-4"/></a>
            <Link to="/website-analyzer" className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15">Audit</Link>
            <button onClick={() => remove(p.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-300" title="Remove"><Trash2 className="w-4 h-4"/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickTools() {
  const items = [
    { to: "/website-analyzer", icon: Gauge, label: "Website Audit" },
    { to: "/seo-analyzer", icon: Search, label: "SEO Audit" },
    { to: "/traffic-checker", icon: BarChart3, label: "Traffic" },
    { to: "/ai-growth-advisor", icon: Sparkles, label: "AI Advisor" },
  ] as const;
  return (
    <div className="glass-strong rounded-3xl p-6">
      <p className="text-xs uppercase text-muted-foreground">Quick tools</p>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map(it => (
          <Link key={it.to} to={it.to} className="glass rounded-xl p-4 hover:bg-white/5 transition flex flex-col items-start gap-2">
            <it.icon className="w-5 h-5 text-[var(--brand-mint)]"/>
            <span className="text-sm font-medium">{it.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
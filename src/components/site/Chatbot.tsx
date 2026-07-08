import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { chat } from "@/lib/chat.functions";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function Chatbot() {
  const send = useServerFn(chat);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your AI growth assistant. Ask me about Shopify, CRO, SEO, ads or email — or describe your store and I'll suggest next steps." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  const onSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await send({ data: { messages: next } });
      if (res.ok) setMsgs([...next, { role: "assistant", content: res.reply }]);
      else setMsgs([...next, { role: "assistant", content: `⚠️ ${res.error}` }]);
    } catch (x: any) {
      setMsgs([...next, { role: "assistant", content: `⚠️ ${x?.message ?? "Failed"}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI assistant"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-brand text-white shadow-[0_0_32px_rgba(255,107,74,0.55)] flex items-center justify-center hover:scale-105 transition"
      >
        {open ? <X className="w-6 h-6"/> : <MessageCircle className="w-6 h-6"/>}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,70vh)] glass-strong rounded-2xl flex flex-col overflow-hidden border border-white/10">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <div className="bg-gradient-brand rounded-lg p-1.5"><Sparkles className="w-4 h-4 text-white"/></div>
            <div>
              <p className="text-sm font-semibold">AI Growth Assistant</p>
              <p className="text-[10px] text-muted-foreground">Powered by SaleshubsWebOffice AI</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-gradient-brand text-white" : "glass"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && <div className="flex justify-start"><div className="glass rounded-2xl px-3 py-2 text-sm flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/>Thinking…</div></div>}
            <div ref={endRef}/>
          </div>
          <form onSubmit={onSend} className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about growth…"
              className="flex-1 glass rounded-xl px-3 py-2 text-sm outline-none"
            />
            <button disabled={busy || !input.trim()} className="px-3 py-2 rounded-xl bg-gradient-brand text-white disabled:opacity-50">
              <Send className="w-4 h-4"/>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
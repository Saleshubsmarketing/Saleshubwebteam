import { submitLead, type LeadInput } from "@/lib/leads.functions";

const FORM_API_ORIGIN = "https://elevate-forge-56.lovable.app";

export async function submitLeadClient(input: Omit<LeadInput, "hp"> & { hp?: string }) {
  const payload: LeadInput = {
    hp: "",
    ...input,
    source_page:
      input.source_page ??
      (typeof window !== "undefined" ? window.location.pathname : undefined),
  } as LeadInput;
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    !window.location.hostname.endsWith(".lovable.app")
  ) {
    const response = await fetch(`${FORM_API_ORIGIN}/api/public/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as Awaited<ReturnType<typeof submitLead>>;
    if (!response.ok && result.ok) {
      return { ok: false as const, error: "Could not send your request. Please try again." };
    }
    return result;
  }

  return submitLead({ data: payload });
}
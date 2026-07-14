import { submitLead, type LeadInput } from "@/lib/leads.functions";

export async function submitLeadClient(input: Omit<LeadInput, "hp"> & { hp?: string }) {
  const payload: LeadInput = {
    hp: "",
    ...input,
    source_page:
      input.source_page ??
      (typeof window !== "undefined" ? window.location.pathname : undefined),
  } as LeadInput;
  return submitLead({ data: payload });
}
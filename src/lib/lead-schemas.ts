import { z } from "zod";

const url = z
  .string()
  .trim()
  .min(4, "Enter a valid store URL")
  .max(255)
  .refine(
    (v) => /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(v),
    "Enter a valid URL (e.g. yourstore.com)",
  );

export const revenueBands = [
  "Under $10k / mo",
  "$10k – $50k / mo",
  "$50k – $250k / mo",
  "$250k+ / mo",
] as const;

export const goals = [
  "Increase conversion rate",
  "Scale paid acquisition",
  "Grow email & retention",
  "Full redesign / rebuild",
  "SEO & organic growth",
] as const;

export const auditStep1Schema = z.object({
  store: url,
  revenue: z.enum(revenueBands),
});

export const auditStep2Schema = z.object({
  goal: z.enum(goals),
  notes: z.string().trim().max(1000).optional(),
});

export const auditStep3Schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
});

export const auditSchema = auditStep1Schema
  .merge(auditStep2Schema)
  .merge(auditStep3Schema);
export type AuditValues = z.infer<typeof auditSchema>;

export const bookCallSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  store: url,
  revenue: z.enum(revenueBands),
  slot: z.string().min(1, "Pick a time slot"),
  goal: z.string().trim().max(500).optional(),
});
export type BookCallValues = z.infer<typeof bookCallSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  store: z
    .string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal("")),
  revenue: z.enum(revenueBands).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (10+ chars)")
    .max(2000),
});
export type ContactValues = z.infer<typeof contactSchema>;
// Server-only email dispatcher for lead notifications via Resend.

type LeadRow = {
  id: string;
  created_at: string;
  form_type: "contact" | "free_audit" | "book_consultation";
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  requested_service: string | null;
  budget: string | null;
  message: string | null;
  source_page: string | null;
  slot: string | null;
};

const ADMIN_EMAIL = "support@saleshubsweboffice.com";
const FROM_NAME = "SaleshubsWebOffice";
// Must be an address on a domain verified in Resend.
const FROM_ADDRESS = "support@saleshubsweboffice.com";
const REPLY_TO = "support@saleshubsweboffice.com";
const SITE = "https://saleshubsweboffice.com";

const FORM_LABEL: Record<LeadRow["form_type"], string> = {
  contact: "Contact",
  free_audit: "Free Audit",
  book_consultation: "Book Consultation",
};

function esc(v: string | null | undefined) {
  if (!v) return "—";
  return v.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function adminHtml(lead: LeadRow) {
  const rows: Array<[string, string | null]> = [
    ["Form Type", FORM_LABEL[lead.form_type]],
    ["Full Name", lead.full_name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Company", lead.company],
    ["Website", lead.website],
    ["Requested Service", lead.requested_service],
    ["Budget", lead.budget],
    ["Time Slot", lead.slot],
    ["Message", lead.message],
    ["Source Page", lead.source_page],
    ["Submitted", new Date(lead.created_at).toUTCString()],
  ];
  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;background:#f6f7f9;width:180px;">${esc(k)}</td><td style="padding:8px 12px;white-space:pre-wrap;">${esc(v ?? "")}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0f172a;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 16px;">🚀 New Website Lead</h2>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">${body}</table>
    <p style="margin-top:24px;font-size:12px;color:#64748b;">Lead ID: ${lead.id}</p>
  </div></body></html>`;
}

function customerHtml(lead: LeadRow) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0f172a;background:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="margin:0 0 12px;">Thank you, ${esc(lead.full_name.split(" ")[0])} 👋</h2>
    <p style="line-height:1.6;">Thanks for contacting <strong>SaleshubsWebOffice</strong>. Your request has been received successfully.</p>
    <p style="line-height:1.6;">Our team will carefully review the information you provided and get back to you with a detailed response within <strong>24–72 hours</strong>.</p>
    <div style="margin:24px 0;padding:16px;background:#f6f7f9;border-radius:8px;">
      <p style="margin:0;font-size:13px;color:#475569;">In the meantime, feel free to explore:</p>
      <p style="margin:8px 0 0;">
        <a href="${SITE}" style="color:#2563eb;text-decoration:none;margin-right:16px;">Home</a>
        <a href="${SITE}/services" style="color:#2563eb;text-decoration:none;margin-right:16px;">Services</a>
        <a href="${SITE}/book-call" style="color:#2563eb;text-decoration:none;">Book Consultation</a>
      </p>
    </div>
    <p style="line-height:1.6;margin-top:32px;">Regards,<br/><strong>Ismail Talha</strong><br/>CEO, SaleshubsWebOffice<br/>
      <a href="${SITE}" style="color:#2563eb;text-decoration:none;">${SITE}</a><br/>
      <a href="mailto:${REPLY_TO}" style="color:#2563eb;text-decoration:none;">${REPLY_TO}</a>
    </p>
  </div></body></html>`;
}

async function sendViaResend(payload: {
  to: string;
  subject: string;
  html: string;
  reply_to?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[leads-email] RESEND_API_KEY not set — skipping email send.");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_ADDRESS}>`,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.reply_to,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[leads-email] Resend send failed [${res.status}]: ${body}`);
    }
  } catch (err) {
    console.error("[leads-email] Resend request threw:", err);
  }
}

export async function sendLeadEmails(lead: LeadRow) {
  const subjectAdmin = `🚀 New Website Lead - ${FORM_LABEL[lead.form_type]} - ${lead.full_name}`;
  await Promise.allSettled([
    sendViaResend({
      to: ADMIN_EMAIL,
      subject: subjectAdmin,
      html: adminHtml(lead),
      reply_to: lead.email,
    }),
    sendViaResend({
      to: lead.email,
      subject: "We've Received Your Request – SaleshubsWebOffice",
      html: customerHtml(lead),
      reply_to: REPLY_TO,
    }),
  ]);
}
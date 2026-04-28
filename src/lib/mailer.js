import nodemailer from "nodemailer";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

let cached = global.__mailer;
if (!cached) cached = global.__mailer = { transporter: null };

function getTransporter() {
  if (cached.transporter) return cached.transporter;

  const host = requiredEnv("SMTP_HOST");
  const port = Number(requiredEnv("SMTP_PORT"));
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");

  cached.transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cached.transporter;
}

/**
 * Sends an email via SMTP.
 *
 * @param {{to:string, subject:string, text?:string, html?:string, from?:string, replyTo?:string, attachments?:any[]}} input
 */
export async function sendEmail(input) {
  const to = input?.to?.toString().trim();
  const subject = input?.subject?.toString().trim();

  if (!to) throw new Error("sendEmail: 'to' is required");
  if (!subject) throw new Error("sendEmail: 'subject' is required");
  if (!input?.text && !input?.html) {
    throw new Error("sendEmail: 'text' or 'html' is required");
  }

  const from = (input?.from || process.env.SMTP_FROM || process.env.SMTP_USER)
    ?.toString()
    .trim();
  if (!from) throw new Error("sendEmail: 'from' is required (SMTP_FROM)");

  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: input?.text,
    html: input?.html,
    replyTo: input?.replyTo,
    attachments: input?.attachments,
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  };
}


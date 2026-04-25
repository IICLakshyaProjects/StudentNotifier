import { renderNumberedTemplate } from "@/lib/template";
import { escapeHtml } from "@/lib/template";

export const DEFAULT_TEMPLATE = `Hi {{1}}, your counselling session is confirmed.

Campus: {{2}}
Date: {{3}}
Time: {{4}}

Location: {{5}}

Please keep your admission card ready and confirm once received.`;

export type CounsellingMessageInput = {
  studentName: string;
  campus: string;
  date: string;
  time: string;
  location: string;
  template?: string;
};

export function buildCounsellingMessage(input: CounsellingMessageInput) {
  const { studentName, campus, date, time, location, template = DEFAULT_TEMPLATE } =
    input;

  return renderNumberedTemplate(template, [
    studentName,
    campus,
    date,
    time,
    location,
  ]).trim();
}

export function buildCounsellingEmailHtml(input: CounsellingMessageInput) {
  const text = buildCounsellingMessage(input);

  const title = "Counselling session confirmed";
  const student = escapeHtml(input.studentName);
  const campus = escapeHtml(input.campus);
  const date = escapeHtml(input.date);
  const time = escapeHtml(input.time);
  const location = escapeHtml(input.location);
  const textHtml = escapeHtml(text).replace(/\n/g, "<br/>");

  const ctaHref = input.location?.toString()?.trim() || "#";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
      <div style="background:linear-gradient(135deg,#4f46e5,#38bdf8);border-radius:18px;padding:18px 18px 14px;color:white;">
        <div style="font-size:12px;opacity:.9;letter-spacing:.08em;text-transform:uppercase;">Student Notifier</div>
        <div style="font-size:20px;font-weight:700;margin-top:6px;">${title}</div>
        <div style="font-size:13px;opacity:.95;margin-top:6px;">Hi ${student}, your session details are below.</div>
      </div>

      <div style="background:#ffffff;border:1px solid rgba(15,23,42,.08);border-radius:18px;box-shadow:0 10px 30px rgba(15,23,42,.06);padding:18px;margin-top:14px;">
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <div style="flex:1;min-width:220px;padding:12px;border-radius:14px;background:#f8fafc;border:1px solid rgba(15,23,42,.06);">
            <div style="font-size:12px;color:#475569;">Campus</div>
            <div style="font-size:14px;font-weight:600;margin-top:4px;color:#0f172a;">${campus}</div>
          </div>
          <div style="flex:1;min-width:220px;padding:12px;border-radius:14px;background:#f8fafc;border:1px solid rgba(15,23,42,.06);">
            <div style="font-size:12px;color:#475569;">Date & time</div>
            <div style="font-size:14px;font-weight:600;margin-top:4px;color:#0f172a;">${date} · ${time}</div>
          </div>
        </div>

        <div style="margin-top:12px;padding:12px;border-radius:14px;background:#f8fafc;border:1px solid rgba(15,23,42,.06);">
          <div style="font-size:12px;color:#475569;">Location</div>
          <div style="font-size:13px;margin-top:6px;word-break:break-word;">
            <a href="${escapeHtml(ctaHref)}" style="color:#4f46e5;text-decoration:none;">${location}</a>
          </div>
          <div style="margin-top:12px;">
            <a href="${escapeHtml(ctaHref)}" style="display:inline-block;background:linear-gradient(180deg,#4f46e5,#4338ca);color:#fff;text-decoration:none;padding:10px 14px;border-radius:12px;font-weight:600;font-size:13px;">
              Open location
            </a>
          </div>
        </div>

        <div style="margin-top:14px;font-size:13px;line-height:1.6;color:#334155;">
          ${textHtml}
        </div>

        <div style="margin-top:16px;font-size:11px;color:#64748b;">
          If you have questions, please contact the campus team.
        </div>
      </div>
    </div>
  </body>
</html>`;
}


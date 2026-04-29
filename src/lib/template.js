function assertStringTemplate(template) {
  if (typeof template !== "string" || template.trim().length === 0) {
    throw new Error("template must be a non-empty string");
  }
}

function coerceValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/**
 * Replaces numbered placeholders like {{1}}, {{2}} ... with provided values.
 * Extra values are ignored; missing values become empty strings.
 */
export function renderNumberedTemplate(template, values) {
  assertStringTemplate(template);
  const safeValues = Array.isArray(values) ? values : [];

  return template.replace(/\{\{\s*(\d+)\s*\}\}/g, (_, rawIndex) => {
    const index = Number(rawIndex);
    if (!Number.isFinite(index) || index <= 0) return "";
    return coerceValue(safeValues[index - 1]);
  });
}

/**
 * Minimal HTML escape for email rendering.
 * Use this if you’re embedding user-provided content into HTML.
 */
export function escapeHtml(input) {
  const s = coerceValue(input);
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
/**
 * Generates HTML email template for counselling session confirmation
 * @param {Object} data - Template data
 * @param {string} [data.baseUrl] - Base URL for absolute image links (e.g. APP_URL)
 * @param {string} data.studentName - Student's name
 * @param {string} data.campus - Campus name
 * @param {string} data.dateTime - Session date and time
 * @param {string} [data.address] - Session address
 * @param {string} data.location - Session location (URL or text)
 * @param {string} [data.contactNumber] - Contact number shown in Important section
 * @param {Record<string, any>} [data.extraFields] - Additional dynamic fields (key->value)
 * @param {string} [data.sessionId] - Session ID shown in email
 * @returns {string} HTML email template
 */
export function generateCounsellingSessionTemplate(data) {
  const {
    baseUrl = process.env.APP_URL || "",
    studentName = "Student",
    campus = "[Campus]",
    dateTime = "[Date and Time]",
    address = "[Address]",
    location = "[Location]",
    contactNumber = "",
    extraFields = {},
    sessionId = "",
  } = data || {};

  const normalizedBaseUrl = String(baseUrl || "").trim().replace(/\/+$/, "");
  function abs(path) {
    const p = String(path || "");
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    if (!normalizedBaseUrl) return p;
    if (!p.startsWith("/")) return `${normalizedBaseUrl}/${p}`;
    return `${normalizedBaseUrl}${p}`;
  }
  const locationHref = (() => {
    const value = String(location || "").trim();
    if (!value) return "";
    if (value === "Location" || value === "[Location]" || value.startsWith("[")) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
  })();

  const logoUrl = abs("/api/images/WHITE.png");
  const bannerUrl = abs("/api/images/bg-banner1.png");
  const cardImageUrl =
    "https://lakshyamailerimages.s3.ap-south-1.amazonaws.com/CMA_USA_MAILER-lal_with_blue_elements_3_-removebg-preview.png";

  // Email clients vary wildly. Avoid flex/grid/clamp/background-image; use tables + inline styles.
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Counselling Session Confirmed</title>
    </head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f5f5;margin:0;padding:0;">
        <tr>
          <td align="center" style="padding:20px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="700" style="width:700px;max-width:700px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.12);">
              <tr>
                <td
                  bgcolor="#0f766e"
                  style="padding:28px 22px;background:#0f766e;background-image:linear-gradient(90deg,#0b7285 0%,#16a34a 55%,#facc15 120%);"
                >
                  <img
                    src="cid:lakshya-logo"
                    alt="Lakshya Logo"
                    height="46"
                    style="display:block;height:46px;width:auto;border:0;outline:none;text-decoration:none;"
                  >
                </td>
              </tr>
              <tr>
                <td style="padding:18px 22px 24px 22px;">
                  <div style="font-size:24px;font-weight:700;color:#003366;line-height:1.35;margin:0 0 10px 0;">
                    Hi ${escapeHtml(studentName)},
                  </div>
                  <div style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 18px 0;">
                    Counselling session confirmed, please find the session details below:
                  </div>

                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    width="100%"
                    style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;"
                  >
                    <tr>
                      <td style="padding:18px;">
                        <table
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                          width="100%"
                          style="background:#ffffff;border-radius:12px;"
                        >
                          <tr>
                            <td style="padding:18px 18px 8px 18px;">
                              <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748B;">
                                Session details
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:0 18px 18px 18px;">
                              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                  <td valign="top" width="74%" style="padding:0 18px 16px 0;">
                                    <div style="font-size:13px;font-weight:700;color:#003366;letter-spacing:0.5px;text-transform:uppercase;margin:0 0 6px 0;">Campus</div>
                                    <div style="font-size:15px;color:#333333;line-height:1.5;word-break:break-word;">${escapeHtml(campus)}</div>

                                    ${
                                      String(sessionId || "").trim()
                                        ? `<div style="font-size:13px;font-weight:700;color:#003366;letter-spacing:0.5px;text-transform:uppercase;margin:14px 0 6px 0;">ID</div>
                                           <div style="font-size:15px;color:#333333;line-height:1.5;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;">${escapeHtml(
                                             sessionId
                                           )}</div>`
                                        : ``
                                    }

                                    <div style="font-size:13px;font-weight:700;color:#003366;letter-spacing:0.5px;text-transform:uppercase;margin:14px 0 6px 0;">Date &amp; Time</div>
                                    <div style="font-size:15px;color:#333333;line-height:1.5;word-break:break-word;">${escapeHtml(dateTime)}</div>

                                    <div style="font-size:13px;font-weight:700;color:#003366;letter-spacing:0.5px;text-transform:uppercase;margin:14px 0 6px 0;">Address</div>
                                    <div style="font-size:15px;color:#333333;line-height:1.5;word-break:break-word;">${escapeHtml(address)}</div>

                                    ${
                                      extraFields && typeof extraFields === "object"
                                        ? Object.entries(extraFields)
                                            .filter(([, v]) => String(v ?? "").trim().length > 0)
                                            .slice(0, 20)
                                            .map(
                                              ([k, v]) => `
                                    <div style="font-size:13px;font-weight:700;color:#003366;letter-spacing:0.5px;text-transform:uppercase;margin:14px 0 6px 0;">${escapeHtml(
                                      k
                                    )}</div>
                                    <div style="font-size:15px;color:#333333;line-height:1.5;word-break:break-word;">${escapeHtml(
                                      v
                                    )}</div>`
                                            )
                                            .join("")
                                        : ""
                                    }

                                    <div style="font-size:13px;font-weight:700;color:#003366;letter-spacing:0.5px;text-transform:uppercase;margin:14px 0 6px 0;">Location</div>
                                    <div style="font-size:15px;color:#333333;line-height:1.5;word-break:break-word;">
                                      ${
                                        locationHref
                                          ? `Please find the campus location for <strong>${escapeHtml(
                                              campus
                                            )}</strong>. <a href="${escapeHtml(
                                              locationHref
                                            )}" target="_blank" rel="noreferrer" style="color:#1d4ed8;text-decoration:underline;font-weight:700;">Click here</a>`
                                          : `${escapeHtml(location)}`
                                      }
                                    </div>
                                  </td>
                                  <td valign="bottom" width="26%" style="padding:0;" align="center">
                                    <img
                                      src="${escapeHtml(cardImageUrl)}"
                                      alt="Session visual"
                                      width="196"
                                      style="display:block;width:196px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;object-fit:contain;"
                                    >
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top:18px;background:#FFFBEB;border:2px solid #FBBF24;border-radius:12px;padding:16px;font-size:15px;color:#333333;line-height:1.7;">
                    <div style="font-weight:700;color:#B45309;margin:0 0 8px 0;font-size:16px;">Important</div>
                    Please keep your admission card ready and confirm once received.<br>
                    If you have questions, please contact the campus team.
                    ${
                      String(contactNumber || "").trim()
                        ? `<br><span style="font-weight:700;color:#0F172A;">Contact:</span> <span style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;">${escapeHtml(contactNumber)}</span>`
                        : ``
                    }
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 22px;background:#f8f9fa;border-top:1px solid #e9ecef;text-align:center;font-size:12px;color:#999999;">
                  © 2026 Lakshya. All rights reserved.<br>
                  This is an automated message, please do not reply to this email.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

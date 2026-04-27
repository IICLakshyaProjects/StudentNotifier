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
 * @param {string} data.studentName - Student's name
 * @param {string} data.campus - Campus name
 * @param {string} data.dateTime - Session date and time
 * @param {string} data.location - Session location
 * @returns {string} HTML email template
 */
export function generateCounsellingSessionTemplate(data) {
  const {
    studentName = "Student",
    campus = "[Campus]",
    dateTime = "[Date and Time]",
    address = "[Address]",
    location = "[Location]",
  } = data || {};
  const locationHref = (() => {
    const value = String(location || "").trim();
    if (!value) return "";
    if (value === "Location" || value === "[Location]" || value.startsWith("[")) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
  })();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Counselling Session Confirmed</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 700px;
          margin: 20px auto;
          background: linear-gradient(180deg, 
            rgba(0, 51, 102, 0.08) 0%, 
            rgba(255, 255, 255, 1) 25%,
            rgba(255, 255, 255, 1) 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          border-radius: 12px;
        }
        .header {
          background-image: url('/api/images/bg-banner1.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          padding: 25px 30px;
          position: relative;
          min-height: 100px;
          display: flex;
          align-items: flex-start;
        }
        .logo {
          position: relative;
          z-index: 1;
          height: 70px;
          width: auto;
        }
        .content {
          padding: 35px 30px;
          background-color: #ffffff;
        }
        .greeting {
          font-size: 24px;
          font-weight: 700;
          color: #003366;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }
        .confirmation-text {
          font-size: 16px;
          color: #333333;
          line-height: 1.6;
          margin-bottom: 28px;
          margin-top: 8px;
        }
        .admission-card-wrapper {
          margin: 30px 0;
        }
        .admission-card {
          background: linear-gradient(135deg, #003366 0%, #0055cc 100%);
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 6px 20px rgba(0, 51, 102, 0.2);
          display: flex;
          align-items: stretch;
          gap: 22px;
          flex-wrap: nowrap;
          min-height: 280px;
        }
        .admission-card-image-container {
          flex-shrink: 0;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          padding: 0;
          overflow: hidden;
        }
        .admission-card-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .details-box {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 22px 20px;
          flex: 1;
          min-width: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          margin-bottom: 18px;
          align-items: flex-start;
        }
        .detail-item:last-child {
          margin-bottom: 0;
        }
        .detail-label {
          font-weight: 700;
          color: #003366;
          font-size: 13px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .detail-value {
          color: #333333;
          font-size: 15px;
          line-height: 1.5;
          word-wrap: break-word;
        }
        .instruction-box {
          background-color: #fff9e6;
          border: 2px solid #ffc107;
          border-radius: 10px;
          padding: 22px;
          margin: 28px 0 0 0;
          font-size: 15px;
          color: #333333;
          line-height: 1.7;
        }
        .instruction-box strong {
          color: #f57f17;
          display: block;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 22px 30px;
          text-align: center;
          font-size: 12px;
          color: #999999;
          border-top: 1px solid #e9ecef;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
          <img src="/api/images/WHITE.png" alt="Lakshya Logo" class="logo">
        </div>

        <!-- Main Content -->
        <div class="content">
          <p class="greeting">Hi ${escapeHtml(studentName)},</p>

          <p class="confirmation-text">
            Counselling session confirmed, please find the session details below:
          </p>

          <!-- Admission Card Section -->
          <div class="admission-card-wrapper">
            <div class="admission-card">
              <!-- Session Details Box -->
              <div class="details-box">
                <div class="detail-item">
                  <div class="detail-label">Campus</div>
                  <div class="detail-value">${escapeHtml(campus)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Date & Time</div>
                  <div class="detail-value">${escapeHtml(dateTime)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Address</div>
                  <div class="detail-value">${escapeHtml(address)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Location</div>
                  <div class="detail-value">${escapeHtml(location)}</div>
                </div>
              </div>
              
              <!-- Admission Card Image on Right -->
              ${
                locationHref
                  ? `<a class="admission-card-image-container" href="${escapeHtml(locationHref)}" target="_blank" rel="noreferrer" aria-label="Open location from image"><img src="/api/images/CMA_USA_MAILER-lal_with_blue_elements_3_-removebg-preview.png" alt="Admission Card" class="admission-card-image"></a>`
                  : `<div class="admission-card-image-container"><img src="/api/images/CMA_USA_MAILER-lal_with_blue_elements_3_-removebg-preview.png" alt="Admission Card" class="admission-card-image"></div>`
              }
            </div>
          </div>

          <!-- Important Instructions -->
          <div class="instruction-box">
            <strong>📋 Important:</strong>
            Please keep your admission card ready and confirm once received.<br>
            If you have questions, please contact the campus team.
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>© 2026 Lakshya. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

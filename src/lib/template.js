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


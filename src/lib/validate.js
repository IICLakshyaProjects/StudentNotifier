export function isEmail(value) {
  const s = String(value ?? "").trim().toLowerCase();
  // pragmatic RFC-5322-ish check; keep it simple for UX
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function normalizeString(value) {
  return String(value ?? "").trim();
}

export function normalizePhone(value) {
  return String(value ?? "")
    .trim()
    .replace(/[^\d+]/g, "");
}


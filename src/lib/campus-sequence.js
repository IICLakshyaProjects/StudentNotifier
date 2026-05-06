export const CAMPUS_SEQUENCE_START = 10010;

export function normalizeCampusSequence(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return CAMPUS_SEQUENCE_START;
  return Math.max(CAMPUS_SEQUENCE_START, Math.floor(n));
}

export function formatCampusSequence(value) {
  return String(normalizeCampusSequence(value)).padStart(5, "0");
}

export function buildCampusSessionId(campusSlug, sequence) {
  return `LAK${campusSlug}${formatCampusSequence(sequence)}`;
}

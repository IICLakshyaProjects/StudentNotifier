/**
 * Parses a simple duration string to seconds.
 * Supports: 30s, 15m, 2h, 7d (case-insensitive). Falls back to number seconds.
 */
export function parseDurationToSeconds(value: string, fallbackSeconds: number) {
  const v = (value || "").toString().trim().toLowerCase();
  if (!v) return fallbackSeconds;

  const m = v.match(/^(\d+)\s*([smhd])?$/);
  if (!m) return fallbackSeconds;

  const n = Number(m[1]);
  const unit = m[2] || "s";
  if (!Number.isFinite(n) || n <= 0) return fallbackSeconds;

  switch (unit) {
    case "s":
      return n;
    case "m":
      return n * 60;
    case "h":
      return n * 60 * 60;
    case "d":
      return n * 60 * 60 * 24;
    default:
      return fallbackSeconds;
  }
}


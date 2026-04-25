export function isInfinitoSynqEnabled() {
  const v = String(process.env.INFINITO_SYNQ ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}


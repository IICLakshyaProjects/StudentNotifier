import axios from "axios";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizePhone(phone) {
  const s = String(phone ?? "").trim();
  return s.replace(/[^\d+]/g, "");
}

function isRetryable(error) {
  const status = error?.response?.status;
  if (!status) return true; // network/timeouts
  return status === 429 || (status >= 500 && status <= 599);
}

function backoffMs(attempt) {
  const base = 400; // ms
  const max = 5000;
  const jitter = Math.floor(Math.random() * 150);
  return Math.min(max, base * 2 ** Math.max(0, attempt - 1) + jitter);
}

let cached = global.__infinitoClient;
if (!cached) cached = global.__infinitoClient = { client: null };

function getClient() {
  if (cached.client) return cached.client;

  const baseURL = requiredEnv("INFINITO_BASE_URL");
  const apiKey = requiredEnv("INFINITO_API_KEY");

  cached.client = axios.create({
    baseURL,
    timeout: Number(process.env.INFINITO_TIMEOUT_MS || 10000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  return cached.client;
}

export class InfinitoError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "InfinitoError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Sends a WhatsApp message via Infinito.
 *
 * Because provider payloads vary, the endpoint and payload shape are configurable:
 * - INFINITO_SEND_PATH (default: /send)
 * - sendWhatsApp({ to, message, templateId, variables, meta })
 */
export async function sendWhatsApp({
  to,
  message,
  templateId,
  variables,
  meta,
} = {}) {
  const toNorm = normalizePhone(to);
  if (!toNorm) throw new Error("sendWhatsApp: 'to' is required");

  const sendPath = process.env.INFINITO_SEND_PATH || "/send";
  const payload = {
    to: toNorm,
    message: message ?? undefined,
    templateId: templateId ?? undefined,
    variables: variables ?? undefined,
    meta: meta ?? undefined,
  };

  const client = getClient();
  const maxAttempts = Number(process.env.INFINITO_MAX_ATTEMPTS || 3);

  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await client.post(sendPath, payload, {
        validateStatus: () => true,
      });

      if (res.status >= 200 && res.status < 300) {
        return { ok: true, status: res.status, data: res.data };
      }

      const err = new InfinitoError("Infinito request failed", {
        status: res.status,
        details: res.data,
      });

      if (attempt < maxAttempts && (res.status === 429 || res.status >= 500)) {
        await sleep(backoffMs(attempt));
        continue;
      }

      throw err;
    } catch (e) {
      lastErr = e;
      if (attempt < maxAttempts && isRetryable(e)) {
        await sleep(backoffMs(attempt));
        continue;
      }
      throw new InfinitoError(e?.message || "Infinito request error", {
        status: e?.response?.status,
        details: e?.response?.data,
        code: e?.code,
      });
    }
  }

  throw lastErr;
}


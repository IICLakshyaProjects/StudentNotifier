import axios from "axios";
import crypto from "node:crypto";

export function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function base64Url(input: Buffer) {
  return input
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function randomString(bytes = 32) {
  return base64Url(crypto.randomBytes(bytes));
}

export function sha256Base64Url(value: string) {
  const hash = crypto.createHash("sha256").update(value).digest();
  return base64Url(hash);
}

export function googleAuthUrl({
  clientId,
  redirectUri,
  state,
  codeChallenge,
  returnTo,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  returnTo?: string;
}) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "select_account");
  if (returnTo) url.searchParams.set("returnTo", returnTo);
  return url.toString();
}

export async function exchangeCodeForTokens({
  code,
  clientId,
  clientSecret,
  redirectUri,
  codeVerifier,
}: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  codeVerifier: string;
}) {
  const res = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10000,
      validateStatus: () => true,
    }
  );

  if (res.status < 200 || res.status >= 300) {
    const msg =
      (res.data && (res.data.error_description || res.data.error)) ||
      "token exchange failed";
    throw new Error(msg);
  }

  return res.data as {
    access_token: string;
    id_token: string;
    expires_in: number;
    token_type: string;
    scope?: string;
    refresh_token?: string;
  };
}

export async function getGoogleIdTokenInfo(idToken: string) {
  const res = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
    params: { id_token: idToken },
    timeout: 10000,
    validateStatus: () => true,
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error("invalid google id_token");
  }
  return res.data as {
    aud: string;
    email?: string;
    email_verified?: string;
    name?: string;
    picture?: string;
    sub?: string;
  };
}


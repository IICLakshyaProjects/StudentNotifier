export function getRequestOrigin(request: Request) {
  // Behind proxies/Vercel/etc.
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return null;
  return `${proto}://${host}`;
}


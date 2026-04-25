export async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  let body = init.body;
  if (Object.prototype.hasOwnProperty.call(init, "json")) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }

  const res = await fetch(path, {
    ...init,
    headers,
    body,
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || "Request failed";
    const err: any = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}


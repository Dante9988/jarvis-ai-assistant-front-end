export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public body?: unknown,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

/**
 * Platform-injectable base URL resolver.
 * Web sets this via NEXT_PUBLIC_API_BASE_URL.
 * Mobile/Desktop will call setBaseUrl() at startup.
 */
let _baseUrl: string | null = null;

export function setBaseUrl(url: string): void {
  _baseUrl = url.replace(/\/+$/, "");
}

export function getBaseUrl(): string {
  if (_baseUrl) return _baseUrl;
  if (typeof process !== "undefined" && process.env) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NEXT_PUBLIC_API_BASE_URL ??
      process.env.API_BASE_URL ??
      "http://localhost:8000"
    );
  }
  return "http://localhost:8000";
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers: extraHeaders, ...rest } = options;
  const url = `${getBaseUrl()}${path}`;

  const headers: Record<string, string> = {
    ...(extraHeaders as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const detail =
      data?.detail ?? data?.message ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, detail, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: "GET" }),

  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: "POST", body }),

  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: "PATCH", body }),

  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};

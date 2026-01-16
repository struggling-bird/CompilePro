const BASE_URL = (import.meta as any)?.env?.VITE_API_BASE ?? "";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  method?: HttpMethod;
  data?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
}

export class ApiError extends Error {
  code: number;
  response: {
    status: number;
    data: unknown;
  };
  constructor(message: string, code: number, data: unknown) {
    super(message);
    this.code = code;
    this.response = { status: code, data };
  }
}

function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return (
    obj &&
    typeof obj === "object" &&
    "code" in obj &&
    "message" in obj &&
    "timestamp" in obj
  );
}

function buildQuery(params?: RequestOptions["params"]): string {
  if (!params) return "";
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    usp.append(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export async function request<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers, params, method = "GET", ...rest } = options;

  const config: RequestInit = {
    ...rest,
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    (config.headers as Record<string, string>)[
      "Authorization"
    ] = `Bearer ${token}`;
  }

  if (data !== undefined && method !== "GET") {
    config.body = JSON.stringify(data);
  }

  const finalUrl = `${BASE_URL}${url}${buildQuery(params)}`;

  const res = await fetch(finalUrl, config);
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};

  if (isApiResponse<T>(body)) {
    if (body.code === 200) {
      return (body.data as T) ?? ({} as T);
    }
    throw new ApiError(body.message || "Error", body.code ?? 500, body);
  }

  if (!res.ok) {
    const msg = (body && (body as any).message) || "Request failed";
    throw new ApiError(msg, res.status, body);
  }

  return body as T;
}

export default request;

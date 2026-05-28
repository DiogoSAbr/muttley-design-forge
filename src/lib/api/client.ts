const RAW_BASE_URL = import.meta.env.VITE_BASE_URL ?? "/api/";
const NORMALIZED = RAW_BASE_URL.endsWith("/") ? RAW_BASE_URL : `${RAW_BASE_URL}/`;
const BASE_URL =
    NORMALIZED.startsWith("http://") || NORMALIZED.startsWith("https://")
        ? NORMALIZED
        : `${typeof window !== "undefined" ? window.location.origin : ""}${
              NORMALIZED.startsWith("/") ? NORMALIZED : `/${NORMALIZED}`
          }`;

const TOKEN_STORAGE_KEY = "authToken";

export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(status: number, message: string, body?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }
}

export function getAuthToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
        return null;
    }
}

export function setAuthToken(token: string | null) {
    try {
        if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
        else localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
        // storage unavailable - ignore
    }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
    body?: BodyInit | object | null;
    params?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, params?: ApiRequestOptions["params"]): string {
    const url = new URL(path.replace(/^\//, ""), BASE_URL);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            url.searchParams.set(key, String(value));
        });
    }
    return url.toString();
}

export async function apiFetch<T = unknown>(
    path: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const { body, params, headers, ...rest } = options;

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const isPlainObject =
        body !== null &&
        body !== undefined &&
        !isFormData &&
        typeof body === "object" &&
        !(body instanceof Blob) &&
        !(body instanceof ArrayBuffer);

    const token = getAuthToken();

    const finalHeaders: Record<string, string> = {
        Accept: "application/json",
        ...(isPlainObject ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers as Record<string, string> | undefined),
    };

    const response = await fetch(buildUrl(path, params), {
        ...rest,
        headers: finalHeaders,
        body: isPlainObject
            ? JSON.stringify(body)
            : (body as BodyInit | null | undefined) ?? undefined,
    });

    if (response.status === 401) {
        setAuthToken(null);
        try {
            localStorage.removeItem("authUser");
        } catch {
            // ignore
        }
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
            window.location.href = "/";
        }
        throw new ApiError(401, "Sessão expirada. Faça login novamente.");
    }

    if (!response.ok) {
        let parsed: unknown = undefined;
        let message = response.statusText || `Erro ${response.status}`;
        try {
            const text = await response.text();
            if (text) {
                try {
                    parsed = JSON.parse(text);
                    if (parsed && typeof parsed === "object" && "message" in parsed) {
                        const m = (parsed as { message?: unknown }).message;
                        if (typeof m === "string") message = m;
                    } else {
                        message = text;
                    }
                } catch {
                    message = text;
                }
            }
        } catch {
            // ignore parse failures
        }
        throw new ApiError(response.status, message, parsed);
    }

    if (response.status === 204) return undefined as T;

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        const raw = await response.json();
        return unwrapEnvelope(raw) as T;
    }
    return (await response.text()) as unknown as T;
}

function unwrapEnvelope(payload: unknown): unknown {
    if (
        payload &&
        typeof payload === "object" &&
        !Array.isArray(payload) &&
        "data" in payload &&
        "status" in payload &&
        ("timestamp" in payload || "path" in payload || "message" in payload)
    ) {
        return (payload as { data: unknown }).data;
    }
    return payload;
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "===".slice((base64.length + 3) % 4);
        const json = atob(padded);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

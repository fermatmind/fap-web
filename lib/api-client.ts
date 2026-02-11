export type ApiErrorShape = { status: number; message: string; details?: unknown };

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.status = shape.status;
    this.details = shape.details;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

type Json = Record<string, unknown>;

async function request<T>(method: string, path: string, body?: Json, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    throw new ApiError({ status: 401, message: 'UNAUTHORIZED' });
  }

  if (res.status === 422) {
    const details = await res.json().catch(() => null);
    throw new ApiError({ status: 422, message: 'VALIDATION_ERROR', details });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError({ status: res.status, message: text || `API_ERROR_${res.status}` });
  }

  const data = (await res.json().catch(() => null)) as T;
  return data;
}

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) => request<T>('GET', path, undefined, init),
  post: <T>(path: string, body?: Json, init?: RequestInit) => request<T>('POST', path, body, init),
  put: <T>(path: string, body?: Json, init?: RequestInit) => request<T>('PUT', path, body, init),
  del: <T>(path: string, init?: RequestInit) => request<T>('DELETE', path, undefined, init),
};

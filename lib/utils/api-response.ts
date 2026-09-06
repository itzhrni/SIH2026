import type { ApiSuccess, ApiError } from "@/types";

export function apiSuccess<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function apiError(code: string, message: string): ApiError {
  return { success: false, error: { code, message } };
}

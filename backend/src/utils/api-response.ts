import { Response } from "express";

type ResponseMeta = Record<string, unknown>;

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: ResponseMeta;
}

interface SendSuccessOptions<T> {
  statusCode?: number;
  message: string;
  data: T;
  meta?: ResponseMeta;
}

export function sendSuccess<T>(
  res: Response,
  options: SendSuccessOptions<T>
): Response<ApiSuccessResponse<T>> {
  const { statusCode = 200, message, data, meta } = options;

  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

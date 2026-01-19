import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string | undefined;
  data?: T;
  error?: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400,
): void => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  res.status(statusCode).json(response);
};

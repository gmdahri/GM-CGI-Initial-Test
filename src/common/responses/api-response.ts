export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  errorCode?: string;
}

export function successResponse<T>(data: T, message = 'Success'): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(
  message: string,
  errors?: Record<string, string[]>,
  errorCode?: string,
): ApiResponse<null> {
  return {
    success: false,
    message,
    errors,
    errorCode,
  };
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export const SUCCESS_CODE = 1000;

export function ok<T>(result: T, message = 'Success'): ApiResponse<T> {
  return {
    code: SUCCESS_CODE,
    message,
    result,
  };
}

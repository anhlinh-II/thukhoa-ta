// Environment variables
export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

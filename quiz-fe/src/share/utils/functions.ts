import { message } from 'antd';
import { LOCALIZED_ERRORS } from './constants';
import loadingService from "../services/loadingService";

// Ensure message is visible (adjust top/z-index if needed)
message.config({ top: 80, maxCount: 3, duration: 4 });

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time duration in seconds to mm:ss format
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate percentage score
 */
export const calculatePercentage = (score: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Centralized error handler for API problems.
 * - If backend returns an ApiResponse with `code`, try to show a localized message for that code.
 * - Otherwise display the backend message (if present) or the generic error message.
 */
export const handleProblems = (error: any) => {
  try {
    // Axios error with server response
    const resp = error?.response?.data;

    if (resp && typeof resp === 'object') {
      const code = typeof resp.code === 'number' ? resp.code : undefined;
      const backendMessage = resp.message || resp.error || (typeof resp === 'string' ? resp : undefined);

      if (code !== undefined) {
        const localized = LOCALIZED_ERRORS[code];
        if (localized) {
          console.debug('handleProblems: showing localized message for code', code, localized);
          // use message.open to ensure consistent rendering and allow custom options
          message.open({ type: 'error', content: localized, duration: 4 });
          return;
        }
        if (backendMessage) {
          console.debug('handleProblems: showing backend message', backendMessage);
          message.open({ type: 'error', content: backendMessage, duration: 4 });
          return;
        }
      }

      // If resp has nested structure e.g. { error: '..' }
      if (resp.error) {
        console.debug('handleProblems: showing resp.error', resp.error);
        message.open({ type: 'error', content: String(resp.error), duration: 4 });
        return;
      }
    }

    // If server returned plain text
    if (error?.response?.data && typeof error.response.data === 'string') {
      console.debug('handleProblems: showing plain string response', error.response.data);
      message.open({ type: 'error', content: error.response.data, duration: 4 });
      return;
    }

    // Fallback to axios/message
    const msg = error?.message || 'Đã có lỗi xảy ra';
    console.debug('handleProblems: fallback message', msg);
    message.open({ type: 'error', content: msg, duration: 4 });
  } catch (e) {
    // Fallback safe message
    message.error('Đã có lỗi xảy ra');
  }
}


export async function navigateWithLoader(router: any, href: string) {
  try {
    loadingService.show();
    // router.push returns a Promise in next/navigation
    await router.push(href);
  } catch (e) {
    throw e;
  } finally {
    // small timeout to keep overlay until navigation begins
    setTimeout(() => loadingService.hide(), 300);
  }
}


import type { NotificationMeta, NotificationSurface } from './notificationStore.js';

export type GlobalNotificationHandler = {
  showSuccess: (
    message: string,
    duration?: number,
    options?: { stackKey?: string; ariaLive?: 'polite' | 'assertive' | 'off'; surface?: NotificationSurface }
  ) => string;
  showError: (message: string, duration?: number) => string;
  showWarning: (message: string, duration?: number) => string;
  showInfo: (message: string, duration?: number, options?: NotificationMeta | null) => string;
  showAchievement: (message: string, duration?: number, options?: Pick<NotificationMeta, 'stackKey'>) => string;
};

export type FallbackLogLevel = 'error' | 'warn' | 'log' | 'info';

let globalNotificationHandler: GlobalNotificationHandler | null = null;

let onFallbackLog: ((level: FallbackLogLevel, message: string) => void) | null = null;

/**
 * Optional sink when no React host has registered a handler (defaults to console.*).
 */
export const configureNotificationFallbackLog = (handler: ((level: FallbackLogLevel, message: string) => void) | null) => {
  onFallbackLog = handler;
};

const fallback = (level: FallbackLogLevel, message: string) => {
  if (onFallbackLog) {
    onFallbackLog(level, message);
    return;
  }
  if (level === 'error') {
    console.error('[Notification]', message);
  } else if (level === 'warn') {
    console.warn('[Notification]', message);
  } else if (level === 'info') {
    console.info('[Notification]', message);
  } else {
    console.log('[Notification]', message);
  }
};

export const setGlobalNotificationHandler = (handler: GlobalNotificationHandler | null) => {
  globalNotificationHandler = handler;
};

export const notifyError = (message: string, duration = 5000) => {
  if (globalNotificationHandler) {
    globalNotificationHandler.showError(message, duration);
  } else {
    fallback('error', message);
  }
};

export const notifyWarning = (message: string, duration = 4000) => {
  if (globalNotificationHandler) {
    globalNotificationHandler.showWarning(message, duration);
  } else {
    fallback('warn', message);
  }
};

export const notifySuccess = (
  message: string,
  duration = 3000,
  options?: { stackKey?: string; ariaLive?: 'polite' | 'assertive' | 'off'; surface?: NotificationSurface }
) => {
  if (globalNotificationHandler) {
    if (options === undefined) {
      globalNotificationHandler.showSuccess(message, duration);
    } else {
      globalNotificationHandler.showSuccess(message, duration, options);
    }
  } else {
    fallback('log', message);
  }
};

export const notifyInfo = (message: string, duration = 3000, options?: NotificationMeta | null) => {
  if (globalNotificationHandler) {
    if (options === undefined || options === null) {
      globalNotificationHandler.showInfo(message, duration);
    } else {
      globalNotificationHandler.showInfo(message, duration, options);
    }
  } else {
    fallback('info', message);
  }
};

export const notifyAchievement = (
  message: string,
  duration = 4000,
  options?: Pick<NotificationMeta, 'stackKey'>
) => {
  if (globalNotificationHandler) {
    if (options === undefined) {
      globalNotificationHandler.showAchievement(message, duration);
    } else {
      globalNotificationHandler.showAchievement(message, duration, options);
    }
  } else {
    fallback('log', message);
  }
};

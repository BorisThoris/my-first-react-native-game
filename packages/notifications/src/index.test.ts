import { describe, expect, test } from 'vitest';
import {
  NotificationHost,
  configureNotificationFallbackLog,
  createNotificationStore,
  notifyError,
  rafDelay,
  setGlobalNotificationHandler,
  useNotificationStore
} from './index.js';

describe('package exports', () => {
  test('public API is importable from index', () => {
    expect(typeof useNotificationStore).toBe('function');
    expect(typeof createNotificationStore).toBe('function');
    expect(typeof NotificationHost).toBe('function');
    expect(typeof setGlobalNotificationHandler).toBe('function');
    expect(typeof notifyError).toBe('function');
    expect(typeof configureNotificationFallbackLog).toBe('function');
    expect(typeof rafDelay).toBe('function');
  });
});

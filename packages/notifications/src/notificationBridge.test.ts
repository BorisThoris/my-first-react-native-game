import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  configureNotificationFallbackLog,
  notifyAchievement,
  notifyError,
  notifyInfo,
  notifySuccess,
  notifyWarning,
  setGlobalNotificationHandler
} from './notificationBridge.js';

describe('notificationBridge', () => {
  afterEach(() => {
    setGlobalNotificationHandler(null);
    configureNotificationFallbackLog(null);
    vi.restoreAllMocks();
  });

  test('falls back to console when no handler is registered', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    notifyError('hello');
    expect(spy).toHaveBeenCalledWith('[Notification]', 'hello');
  });

  test('uses configureNotificationFallbackLog when set', () => {
    const sink = vi.fn();
    configureNotificationFallbackLog(sink);
    notifyError('x');
    expect(sink).toHaveBeenCalledWith('error', 'x');
  });

  test('routes notifySuccess, notifyWarning, notifyInfo, notifyAchievement through handler when set', () => {
    const handler = {
      showSuccess: vi.fn(() => 'id-s'),
      showWarning: vi.fn(() => 'id-w'),
      showError: vi.fn(() => 'id-e'),
      showInfo: vi.fn(() => 'id-i'),
      showAchievement: vi.fn(() => 'id-a')
    };
    setGlobalNotificationHandler(handler);

    notifySuccess('ok', 111);
    notifyWarning('care', 222);
    notifyInfo('fyi', 333);
    notifyAchievement('cleared', 2000, { stackKey: 'floor' });

    expect(handler.showSuccess).toHaveBeenCalledWith('ok', 111);
    expect(handler.showWarning).toHaveBeenCalledWith('care', 222);
    expect(handler.showInfo).toHaveBeenCalledWith('fyi', 333);
    expect(handler.showAchievement).toHaveBeenCalledWith('cleared', 2000, { stackKey: 'floor' });
  });

  test('forwards optional options on notifySuccess (stackKey)', () => {
    const handler = {
      showSuccess: vi.fn(() => 'id'),
      showWarning: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn(),
      showAchievement: vi.fn()
    };
    setGlobalNotificationHandler(handler);
    notifySuccess('x', 100, { stackKey: 'sk', surface: 'match-score' });
    expect(handler.showSuccess).toHaveBeenCalledWith('x', 100, { stackKey: 'sk', surface: 'match-score' });
  });

  test('fallback levels for success and info without handler', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    notifySuccess('s');
    notifyInfo('i');

    expect(logSpy).toHaveBeenCalledWith('[Notification]', 's');
    expect(infoSpy).toHaveBeenCalledWith('[Notification]', 'i');
  });

  test('fallback warn without handler', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    notifyWarning('w');
    expect(warnSpy).toHaveBeenCalledWith('[Notification]', 'w');
  });
});

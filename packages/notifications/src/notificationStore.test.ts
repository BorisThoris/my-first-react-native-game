import { describe, expect, test, beforeEach, vi, afterEach } from 'vitest';
import * as rafDelayModule from './rafDelay.js';
import { createNotificationStore, useNotificationStore } from './notificationStore.js';

describe('notificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      maxNotifications: 5,
      notificationSequence: 0
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('keeps deterministic notification ids', () => {
    const firstId = useNotificationStore.getState().showInfo('first', 0);
    const secondId = useNotificationStore.getState().showInfo('second', 0);

    expect(firstId).toMatch(/^notification_\d+$/);
    expect(secondId).toMatch(/^notification_\d+$/);
    expect(firstId).not.toBe(secondId);
  });

  test('limits non-confirm notifications queue size', () => {
    for (let i = 0; i < 7; i += 1) {
      useNotificationStore.getState().showInfo(`message-${i}`, 0);
    }

    const { notifications } = useNotificationStore.getState();
    expect(notifications).toHaveLength(5);
    expect(notifications[0]?.message).toBe('message-2');
    expect(notifications[4]?.message).toBe('message-6');
  });

  test('preserves confirmation notifications when queue overflows', () => {
    const confirmPromise = useNotificationStore.getState().confirm('confirm-me');
    useNotificationStore.getState().showInfo('message-1', 0);
    useNotificationStore.getState().showInfo('message-2', 0);
    useNotificationStore.getState().showInfo('message-3', 0);
    useNotificationStore.getState().showInfo('message-4', 0);
    useNotificationStore.getState().showInfo('message-5', 0);

    const { notifications } = useNotificationStore.getState();
    expect(notifications).toHaveLength(5);
    expect(notifications.some((item) => item.message === 'confirm-me')).toBe(true);

    const confirmItem = notifications.find((item) => item.message === 'confirm-me');
    expect(confirmItem?.onConfirm).toBeTruthy();
    confirmItem?.onConfirm?.onConfirm(true);

    return expect(confirmPromise).resolves.toBe(true);
  });

  test('resolves confirmation as false when notification is dismissed', async () => {
    const confirmPromise = useNotificationStore.getState().confirm('dismiss-me');
    const confirmItem = useNotificationStore
      .getState()
      .notifications.find((item) => item.message === 'dismiss-me');

    expect(confirmItem).toBeTruthy();
    useNotificationStore.getState().removeNotification(confirmItem!.id);

    await expect(confirmPromise).resolves.toBe(false);
  });

  test('resolves overflowed confirmations as false when queue only has confirms', async () => {
    useNotificationStore.getState().setMaxNotifications(1);
    const firstConfirmPromise = useNotificationStore.getState().confirm('confirm-1');
    const secondConfirmPromise = useNotificationStore.getState().confirm('confirm-2');

    await expect(firstConfirmPromise).resolves.toBe(false);
    const remainingConfirm = useNotificationStore.getState().notifications[0];
    expect(remainingConfirm).toBeTruthy();
    useNotificationStore.getState().resolveNotification(remainingConfirm!.id, true);
    await expect(secondConfirmPromise).resolves.toBe(true);
  });

  test('clearNotifications resolves pending confirmations as false', async () => {
    const confirmPromise = useNotificationStore.getState().confirm('clear-me');
    useNotificationStore.getState().clearNotifications();

    await expect(confirmPromise).resolves.toBe(false);
  });

  test('setMaxNotifications enforces a clamped integer limit and trims immediately', () => {
    for (let i = 0; i < 4; i += 1) {
      useNotificationStore.getState().showInfo(`message-${i}`, 0);
    }

    useNotificationStore.getState().setMaxNotifications(2.9);

    const state = useNotificationStore.getState();
    expect(state.maxNotifications).toBe(2);
    expect(state.notifications).toHaveLength(2);
    expect(state.notifications[0]?.message).toBe('message-2');
    expect(state.notifications[1]?.message).toBe('message-3');
  });

  test('createNotificationStore returns an isolated store instance', () => {
    const a = createNotificationStore();
    const b = createNotificationStore();

    a.getState().showInfo('only-a', 0);
    b.getState().showInfo('only-b', 0);

    expect(a.getState().notifications).toHaveLength(1);
    expect(a.getState().notifications[0]?.message).toBe('only-a');
    expect(b.getState().notifications).toHaveLength(1);
    expect(b.getState().notifications[0]?.message).toBe('only-b');
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  test('auto-dismiss schedules remove via rafDelay', async () => {
    vi.spyOn(rafDelayModule, 'rafDelay').mockImplementation((cb) => {
      queueMicrotask(cb);
      return () => {};
    });

    useNotificationStore.getState().showInfo('auto-dismiss', 3000);
    expect(useNotificationStore.getState().notifications).toHaveLength(1);

    await Promise.resolve();
    await Promise.resolve();

    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  test('onDismiss runs when a simple toast is removed', () => {
    const onDismiss = vi.fn();
    const id = useNotificationStore.getState().addNotification('x', 'info', 0, null, onDismiss);
    useNotificationStore.getState().removeNotification(id);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('onDismiss runs once for clearNotifications', () => {
    const onDismiss = vi.fn();
    useNotificationStore.getState().addNotification('a', 'info', 0, null, onDismiss);
    useNotificationStore.getState().clearNotifications();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('onDismiss is not invoked for confirm dialogs', async () => {
    const onDismiss = vi.fn();
    const id = useNotificationStore.getState().addNotification(
      'confirm?',
      'info',
      0,
      { onCancel: () => {}, onConfirm: () => {} },
      onDismiss
    );
    useNotificationStore.getState().resolveNotification(id, false);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  test('onDismiss runs when a toast is dropped by queue limit', () => {
    const droppedDismiss = vi.fn();
    useNotificationStore.getState().addNotification('victim', 'info', 0, null, droppedDismiss);
    for (let i = 0; i < 5; i += 1) {
      useNotificationStore.getState().showInfo(`push-${i}`, 0);
    }
    expect(useNotificationStore.getState().notifications).toHaveLength(5);
    expect(droppedDismiss).toHaveBeenCalledTimes(1);
  });
});

import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { notifyError } from './notificationBridge.js';
import { useNotificationStore } from './notificationStore.js';
import { NotificationHost } from './NotificationHost.js';

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot> | null = null;

const renderWithProviders = async () => {
  await act(async () => {
    root = createRoot(container);
    root.render(
      <NotificationHost>
        <div data-testid="child-content">content</div>
      </NotificationHost>
    );
  });
};

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

const findCloseButton = () =>
  container.querySelector('button[aria-label="Close notification"]') as HTMLButtonElement | null;

describe('NotificationHost', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    useNotificationStore.setState({
      notifications: [],
      maxNotifications: 5,
      notificationSequence: 0
    });
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root!.unmount();
      });
      root = null;
    }
    if (container) {
      container.remove();
    }
    vi.restoreAllMocks();
  });

  test('uses semantic roles for info, error, and confirmation notifications', async () => {
    await renderWithProviders();

    await act(async () => {
      useNotificationStore.getState().showInfo('info-message', 0);
      useNotificationStore.getState().showError('error-message', 0);
    });
    let confirmPromise!: Promise<boolean>;
    await act(async () => {
      confirmPromise = useNotificationStore.getState().confirm('confirm-message');
    });
    await flush();

    const statusNotification = container.querySelector('[role="status"]');
    const errorNotification = container.querySelector('[role="alert"]');
    const confirmNotification = container.querySelector('[role="alertdialog"]');

    expect(statusNotification?.textContent).toContain('info-message');
    expect(errorNotification?.textContent).toContain('error-message');
    expect(confirmNotification?.textContent).toContain('confirm-message');

    const confirmItem = useNotificationStore
      .getState()
      .notifications.find((notification) => notification.message === 'confirm-message');
    expect(confirmItem).toBeTruthy();
    await act(async () => {
      useNotificationStore.getState().resolveNotification(confirmItem!.id, true);
    });
    await expect(confirmPromise).resolves.toBe(true);
  });

  test('dismiss button resolves confirmation as false', async () => {
    await renderWithProviders();

    let confirmPromise!: Promise<boolean>;
    await act(async () => {
      confirmPromise = useNotificationStore.getState().confirm('dismiss-confirm');
    });
    await flush();
    const closeButton = findCloseButton();
    expect(closeButton).toBeTruthy();
    await act(async () => {
      closeButton!.click();
    });

    await expect(confirmPromise).resolves.toBe(false);
    await flush();
    expect(container.textContent).not.toContain('dismiss-confirm');
  });

  test('escape key cancels confirmation notifications', async () => {
    await renderWithProviders();

    let confirmPromise!: Promise<boolean>;
    await act(async () => {
      confirmPromise = useNotificationStore.getState().confirm('escape-confirm');
    });
    await flush();
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    });

    await expect(confirmPromise).resolves.toBe(false);
  });

  test('applies custom labels to region and controls', async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(
        <NotificationHost labels={{ regionAriaLabel: 'Alerts', closeAriaLabel: 'Dismiss' }}>
          <span>app</span>
        </NotificationHost>
      );
    });

    await act(async () => {
      useNotificationStore.getState().showInfo('hello', 0);
    });
    await flush();

    expect(container.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Alerts');
    expect(container.querySelector('button[aria-label="Dismiss"]')).toBeTruthy();
  });

  test('imperative notifyError shows toast when host is mounted', async () => {
    await renderWithProviders();

    await act(async () => {
      notifyError('from-imperative', 0);
    });
    await flush();

    expect(container.textContent).toContain('from-imperative');
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });

  test('unmount clears global handler so notifyError falls back to console', async () => {
    await renderWithProviders();
    await flush();

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      root!.unmount();
      root = null;
    });

    notifyError('after-unmount');
    expect(spy).toHaveBeenCalledWith('[Notification]', 'after-unmount');
  });

  test('confirm and cancel buttons resolve the promise', async () => {
    await renderWithProviders();

    let confirmPromise!: Promise<boolean>;
    await act(async () => {
      confirmPromise = useNotificationStore.getState().confirm('choose');
    });
    await flush();

    const confirmBtn = container.querySelector('button[aria-label="Confirm"]') as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();

    await act(async () => {
      confirmBtn.click();
    });
    await expect(confirmPromise).resolves.toBe(true);

    let second!: Promise<boolean>;
    await act(async () => {
      second = useNotificationStore.getState().confirm('choose-again');
    });
    await flush();
    const cancelBtn2 = container.querySelector('button[aria-label="Cancel"]') as HTMLButtonElement;
    expect(cancelBtn2).toBeTruthy();
    await act(async () => {
      cancelBtn2.click();
    });
    await expect(second).resolves.toBe(false);
  });

  test('achievement surface exposes data attribute and polite live region', async () => {
    await renderWithProviders();

    await act(async () => {
      useNotificationStore.getState().showAchievement('Badge — description', 0);
    });
    await flush();

    const toast = container.querySelector('[data-crn-surface="achievement"]');
    expect(toast).toBeTruthy();
    expect(toast?.getAttribute('aria-live')).toBe('polite');
    expect(toast?.textContent).toContain('Badge — description');
  });

  test('score-style success toast can set aria-live off', async () => {
    await renderWithProviders();

    await act(async () => {
      useNotificationStore.getState().showSuccess('+123', 0, { ariaLive: 'off' });
    });
    await flush();

    const toast = container.querySelector('.crn-card--success');
    expect(toast?.getAttribute('aria-live')).toBe('off');
  });
});

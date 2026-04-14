import { subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand/react';
import { rafDelay } from './rafDelay.js';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/** Visual + a11y grouping: generic info rail vs milestone vs powers FTUE chrome (OVR-004 / OVR-006). */
export type NotificationSurface = 'generic' | 'achievement' | 'powers-ftue';

export type NotificationMeta = {
  stackKey?: string;
  surface?: NotificationSurface;
  /** Overrides default type-based `aria-live` on the toast root (OVR-004). */
  ariaLive?: 'polite' | 'assertive' | 'off';
};

export type ConfirmHandlerBundle = {
  isSettled: () => boolean;
  onConfirm: (result: boolean) => void;
  onCancel: (result: boolean) => void;
};

export type NotificationRecord = {
  duration: number;
  id: string;
  message: string;
  onConfirm: ConfirmHandlerBundle | null;
  /** Called when this toast is removed (timeout, X, queue trim, clear). Ignored when `onConfirm` is set (confirm dialogs use confirm/cancel handlers only). */
  onDismiss?: (() => void) | null;
  /**
   * Optional coalescing key: adding another toast with the same key removes the previous one first
   * (OVR-005 / score rail — avoids stacking many identical short toasts).
   */
  stackKey?: string;
  /** Defaults to `generic` at render when omitted. */
  surface?: NotificationSurface;
  /** When set, overrides default `aria-live` derived from `type`. */
  ariaLive?: 'polite' | 'assertive' | 'off';
  type: NotificationType;
};

const DEFAULT_NOTIFICATION_LIMIT = 5;

type ConfirmInput =
  | ((result: boolean) => void)
  | {
      onConfirm?: (result: boolean) => void;
      onCancel?: (result: boolean) => void;
    };

const resolveConfirmHandlers = (onConfirm: ConfirmInput | null): ConfirmHandlerBundle | null => {
  if (!onConfirm) {
    return null;
  }

  const confirmHandler =
    typeof onConfirm === 'function'
      ? onConfirm
      : typeof onConfirm.onConfirm === 'function'
        ? onConfirm.onConfirm
        : null;
  const cancelHandler =
    typeof onConfirm === 'object' && typeof onConfirm.onCancel === 'function' ? onConfirm.onCancel : null;

  if (!confirmHandler && !cancelHandler) {
    return null;
  }

  let settled = false;
  const wrapSettlement =
    (handler: ((result: boolean) => void) | null | undefined) => (result: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      if (typeof handler === 'function') {
        handler(result);
      }
    };

  return {
    isSettled: () => settled,
    onConfirm: wrapSettlement(confirmHandler ?? null),
    onCancel: wrapSettlement(cancelHandler ?? null)
  };
};

const settleConfirmation = (notification: NotificationRecord | null | undefined, result = false) => {
  const confirmHandlers = notification?.onConfirm;
  if (!confirmHandlers || confirmHandlers.isSettled()) {
    return;
  }

  if (result) {
    confirmHandlers.onConfirm(true);
    return;
  }

  confirmHandlers.onCancel(false);
};

/** Non-confirm toasts only; never combined with confirm dialog resolution per product contract. */
const invokeNonConfirmDismiss = (notification: NotificationRecord | null | undefined) => {
  if (!notification?.onDismiss || notification.onConfirm) {
    return;
  }
  notification.onDismiss();
};

const enforceNotificationLimit = (
  notifications: NotificationRecord[],
  limit: number
): { notifications: NotificationRecord[]; removed: NotificationRecord[] } => {
  if (!Array.isArray(notifications)) {
    return {
      notifications: [],
      removed: []
    };
  }
  if (notifications.length <= limit) {
    return {
      notifications,
      removed: []
    };
  }

  const next = [...notifications];
  const removed: NotificationRecord[] = [];
  while (next.length > limit) {
    const firstNonConfirmIndex = next.findIndex((notification) => !notification?.onConfirm);
    const removalIndex = firstNonConfirmIndex === -1 ? 0 : firstNonConfirmIndex;
    const removedNotification = next.splice(removalIndex, 1)[0];
    if (removedNotification) {
      removed.push(removedNotification);
    }
  }

  return {
    notifications: next,
    removed
  };
};

export type NotificationStoreState = {
  notifications: NotificationRecord[];
  maxNotifications: number;
  notificationSequence: number;
  getNextNotificationId: () => string;
  addNotification: (
    message: string,
    type?: NotificationType,
    duration?: number,
    onConfirm?: ConfirmInput | null,
    onDismiss?: (() => void) | null,
    meta?: NotificationMeta | null
  ) => string;
  resolveNotification: (id: string, result?: boolean) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setMaxNotifications: (value: number) => void;
  showSuccess: (
    message: string,
    duration?: number,
    options?: { stackKey?: string; ariaLive?: 'polite' | 'assertive' | 'off' }
  ) => string;
  showError: (message: string, duration?: number) => string;
  showWarning: (message: string, duration?: number) => string;
  showInfo: (message: string, duration?: number, options?: NotificationMeta | null) => string;
  showAchievement: (message: string, duration?: number, options?: Pick<NotificationMeta, 'stackKey'>) => string;
  confirm: (message: string) => Promise<boolean>;
};

export const createNotificationStore = () =>
  create<NotificationStoreState>()(
    subscribeWithSelector((set, get) => ({
      notifications: [],
      maxNotifications: DEFAULT_NOTIFICATION_LIMIT,
      notificationSequence: 0,

      getNextNotificationId: () => {
        const nextValue = get().notificationSequence + 1;
        set({ notificationSequence: nextValue });
        return `notification_${nextValue}`;
      },

      addNotification: (message, type = 'info', duration = 3000, onConfirm = null, onDismiss = null, meta = null) => {
        const stackKey = meta?.stackKey;
        const surface = meta?.surface;
        const ariaLive = meta?.ariaLive;
        if (stackKey) {
          const stale = get().notifications.filter((n) => n.stackKey === stackKey);
          for (const n of stale) {
            settleConfirmation(n, false);
            invokeNonConfirmDismiss(n);
          }
          if (stale.length > 0) {
            set((state) => ({
              notifications: state.notifications.filter((n) => n.stackKey !== stackKey)
            }));
          }
        }

        const id = get().getNextNotificationId();
        const normalizedConfirmHandlers = resolveConfirmHandlers(onConfirm);
        const newNotification: NotificationRecord = {
          duration,
          id,
          message,
          onConfirm: normalizedConfirmHandlers,
          onDismiss: onDismiss ?? undefined,
          stackKey,
          surface,
          ariaLive,
          type
        };

        let removedByLimit: NotificationRecord[] = [];
        set((state) => ({
          notifications: (() => {
            const { notifications: limitedNotifications, removed } = enforceNotificationLimit(
              [...state.notifications, newNotification],
              state.maxNotifications
            );
            removedByLimit = removed;
            return limitedNotifications;
          })()
        }));
        removedByLimit.forEach((notification) => {
          settleConfirmation(notification, false);
          invokeNonConfirmDismiss(notification);
        });

        if (duration > 0 && !normalizedConfirmHandlers) {
          rafDelay(() => {
            get().removeNotification(id);
          }, duration);
        }

        return id;
      },

      resolveNotification: (id, result = false) => {
        let removedNotification: NotificationRecord | null = null;
        set((state) => {
          removedNotification = state.notifications.find((notification) => notification.id === id) ?? null;
          return {
            notifications: state.notifications.filter((notification) => notification.id !== id)
          };
        });
        settleConfirmation(removedNotification, result);
        invokeNonConfirmDismiss(removedNotification);
      },

      removeNotification: (id) => {
        get().resolveNotification(id, false);
      },

      clearNotifications: () => {
        const notifications = get().notifications;
        notifications.forEach((notification) => {
          settleConfirmation(notification, false);
          invokeNonConfirmDismiss(notification);
        });
        set({ notifications: [] });
      },

      setMaxNotifications: (value) => {
        const nextLimit = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : DEFAULT_NOTIFICATION_LIMIT;
        let removedByLimit: NotificationRecord[] = [];
        set((state) => ({
          maxNotifications: nextLimit,
          notifications: (() => {
            const { notifications: limitedNotifications, removed } = enforceNotificationLimit(
              state.notifications,
              nextLimit
            );
            removedByLimit = removed;
            return limitedNotifications;
          })()
        }));
        removedByLimit.forEach((notification) => {
          settleConfirmation(notification, false);
          invokeNonConfirmDismiss(notification);
        });
      },

      showSuccess: (message, duration = 3000, options) => {
        return get().addNotification(message, 'success', duration, null, null, {
          stackKey: options?.stackKey,
          ariaLive: options?.ariaLive
        });
      },

      showError: (message, duration = 5000) => {
        return get().addNotification(message, 'error', duration, null, null);
      },

      showWarning: (message, duration = 4000) => {
        return get().addNotification(message, 'warning', duration, null, null);
      },

      showInfo: (message, duration = 3000, options) => {
        return get().addNotification(message, 'info', duration, null, null, options ?? null);
      },

      showAchievement: (message, duration = 3000, options) => {
        return get().addNotification(message, 'info', duration, null, null, {
          stackKey: options?.stackKey,
          surface: 'achievement',
          ariaLive: 'polite'
        });
      },

      confirm: (message) => {
        return new Promise<boolean>((resolve) => {
          const onConfirm = (result: boolean) => {
            resolve(result);
          };
          const onCancel = (result: boolean) => {
            resolve(result);
          };
          get().addNotification(message, 'info', 0, { onCancel, onConfirm });
        });
      }
    }))
  );

/** Default app-wide store (matches MusicalAppReactConcept singleton pattern). */
export const useNotificationStore = createNotificationStore();

export type NotificationStore = ReturnType<typeof createNotificationStore>;

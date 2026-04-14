import { useCallback, useEffect, useMemo } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import type { NotificationRecord } from './notificationStore.js';
import { useNotificationStore } from './notificationStore.js';
import { setGlobalNotificationHandler } from './notificationBridge.js';
import './notification-host.css';

export type NotificationLabels = {
  closeAriaLabel: string;
  confirm: string;
  cancel: string;
  regionAriaLabel: string;
};

const defaultLabels: NotificationLabels = {
  closeAriaLabel: 'Close notification',
  confirm: 'Confirm',
  cancel: 'Cancel',
  regionAriaLabel: 'Notifications'
};

const cardClassForType = (type: NotificationRecord['type']) => {
  switch (type) {
    case 'success':
      return 'crn-card crn-card--success';
    case 'warning':
      return 'crn-card crn-card--warning';
    case 'error':
      return 'crn-card crn-card--error';
    default:
      return 'crn-card crn-card--info';
  }
};

const getNotificationRole = (notification: NotificationRecord) => {
  if (notification.onConfirm) {
    return 'alertdialog';
  }
  return notification.type === 'error' ? 'alert' : 'status';
};

const getNotificationLiveMode = (notification: NotificationRecord) => {
  if (notification.ariaLive) {
    return notification.ariaLive;
  }
  return notification.type === 'error' ? 'assertive' : 'polite';
};

const surfaceDataAttribute = (notification: NotificationRecord) => {
  const surface = notification.surface ?? 'generic';
  return surface === 'generic' ? undefined : surface;
};

type NotificationItemProps = {
  notification: NotificationRecord;
  onResolve: (id: string, result: boolean) => void;
  labels: NotificationLabels;
};

const NotificationItem = ({ notification, onResolve, labels }: NotificationItemProps) => {
  const className = cardClassForType(notification.type);
  const isConfirmNotification = Boolean(notification.onConfirm);
  const messageId = `notification-message-${notification.id}`;

  const handleClose = useCallback(() => {
    onResolve(notification.id, false);
  }, [notification.id, onResolve]);

  const handleConfirm = useCallback(() => {
    onResolve(notification.id, true);
  }, [notification.id, onResolve]);

  const handleCancel = useCallback(() => {
    onResolve(notification.id, false);
  }, [notification.id, onResolve]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      if (isConfirmNotification) {
        onResolve(notification.id, false);
      }
    },
    [isConfirmNotification, notification.id, onResolve]
  );

  return (
    <div
      className={className}
      data-crn-surface={surfaceDataAttribute(notification)}
      data-crn-stack-key={notification.stackKey ?? undefined}
      aria-atomic="true"
      aria-describedby={messageId}
      aria-live={getNotificationLiveMode(notification)}
      aria-modal={isConfirmNotification ? 'false' : undefined}
      onKeyDown={isConfirmNotification ? handleKeyDown : undefined}
      role={getNotificationRole(notification)}
      tabIndex={isConfirmNotification ? 0 : undefined}
    >
      <button type="button" className="crn-close" onClick={handleClose} aria-label={labels.closeAriaLabel}>
        ×
      </button>
      <div className="crn-message" id={messageId}>
        {notification.message}
      </div>
      {isConfirmNotification && (
        <div className="crn-actions">
          <button type="button" className="crn-action" aria-label={labels.confirm} onClick={handleConfirm}>
            {labels.confirm}
          </button>
          <button type="button" className="crn-action" aria-label={labels.cancel} onClick={handleCancel}>
            {labels.cancel}
          </button>
        </div>
      )}
    </div>
  );
};

export type NotificationHostProps = {
  children?: ReactNode;
  labels?: Partial<NotificationLabels>;
};

/**
 * Renders the toast stack and registers the imperative bridge (`notify*`).
 * Theme via CSS variables on a parent or on `.crn-host` (see `notification-host.css`).
 */
export const NotificationHost = ({ children, labels: labelsProp }: NotificationHostProps) => {
  const notifications = useNotificationStore((state) => state.notifications);
  const resolveNotification = useNotificationStore((state) => state.resolveNotification);
  const labels = useMemo(() => ({ ...defaultLabels, ...labelsProp }), [labelsProp]);

  useEffect(() => {
    const store = useNotificationStore.getState();
    setGlobalNotificationHandler({
      showSuccess: store.showSuccess,
      showError: store.showError,
      showWarning: store.showWarning,
      showInfo: store.showInfo
    });
    return () => setGlobalNotificationHandler(null);
  }, []);

  useEffect(() => {
    const activeConfirm = [...notifications].reverse().find((notification) => notification.onConfirm);
    if (!activeConfirm) {
      return undefined;
    }

    const handleEscapeDismiss = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      resolveNotification(activeConfirm.id, false);
    };

    window.addEventListener('keydown', handleEscapeDismiss);
    return () => window.removeEventListener('keydown', handleEscapeDismiss);
  }, [notifications, resolveNotification]);

  return (
    <>
      {children}
      <div className="crn-host" aria-label={labels.regionAriaLabel} role="region">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onResolve={resolveNotification}
            labels={labels}
          />
        ))}
      </div>
    </>
  );
};

/** Alias matching the MusicalAppReactConcept provider name. */
export const NotificationProvider = NotificationHost;

export const useNotificationActions = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const resolveNotification = useNotificationStore((state) => state.resolveNotification);
  const showSuccess = useNotificationStore((state) => state.showSuccess);
  const showError = useNotificationStore((state) => state.showError);
  const showWarning = useNotificationStore((state) => state.showWarning);
  const showInfo = useNotificationStore((state) => state.showInfo);
  const showAchievement = useNotificationStore((state) => state.showAchievement);
  const confirm = useNotificationStore((state) => state.confirm);

  return {
    addNotification,
    removeNotification,
    resolveNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAchievement,
    confirm
  };
};

export const useNotifications = () => useNotificationStore((state) => state.notifications);

export const useNotification = () => {
  const notifications = useNotifications();
  const actions = useNotificationActions();

  return {
    notifications,
    ...actions
  };
};

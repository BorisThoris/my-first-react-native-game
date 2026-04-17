import { useNotificationStore } from './notificationStore.js';

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

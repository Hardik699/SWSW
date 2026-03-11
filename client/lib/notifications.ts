/**
 * Notification system for IT department
 * Stores notifications in localStorage and can be synced with backend API
 */

export interface ITNotification {
  id: string;
  type: "new_employee" | "employee_update" | "employee_deleted";
  employeeId: string;
  employeeName: string;
  department: string;
  tableNumber: string;
  message: string;
  createdAt: string;
  processed: boolean;
}

const NOTIFICATIONS_KEY = "it_notifications";

/**
 * Get all notifications from localStorage
 */
export function getNotifications(): ITNotification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading notifications:", error);
    return [];
  }
}

/**
 * Get unprocessed notifications
 */
export function getPendingNotifications(): ITNotification[] {
  return getNotifications().filter((n) => !n.processed);
}

/**
 * Add a new notification
 */
export function addNotification(
  notification: Omit<ITNotification, "id" | "createdAt">,
): ITNotification {
  const newNotification: ITNotification = {
    ...notification,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  const notifications = getNotifications();
  notifications.push(newNotification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

  return newNotification;
}

/**
 * Mark notification as processed
 */
export function markAsProcessed(notificationId: string): void {
  const notifications = getNotifications();
  const notification = notifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.processed = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications().filter(
    (n) => n.id !== notificationId,
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  localStorage.removeItem(NOTIFICATIONS_KEY);
}

/**
 * Create a new employee notification
 */
export function notifyNewEmployee(
  employeeId: string,
  employeeName: string,
  department: string,
  tableNumber: string,
): ITNotification {
  return addNotification({
    type: "new_employee",
    employeeId,
    employeeName,
    department,
    tableNumber,
    message: `New employee ${employeeName} from ${department} ready for IT setup`,
    processed: false,
  });
}

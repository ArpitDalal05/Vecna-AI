export interface NotificationRow {
  id: string;
  title: string;
  message: string;
  type: "ALERT" | "INFO" | "SUCCESS" | "WARNING";
  isRead: boolean;
  timestamp: string;
}

export let notificationsTable: NotificationRow[] = [
  { id: "N1", title: "Intrusion Shield Active", message: "Supabase authentication guard successfully mounted.", type: "SUCCESS", isRead: false, timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: "N2", title: "GPU Engine Online", message: "WebGL custom shader particles core running at 60fps.", type: "INFO", isRead: false, timestamp: new Date(Date.now() - 120000).toISOString() }
];

export function insertNotification(notif: NotificationRow) {
  notificationsTable.unshift(notif);
  if (notificationsTable.length > 100) {
    notificationsTable.pop();
  }
}

export function markAllNotificationsRead() {
  notificationsTable = notificationsTable.map(n => ({ ...n, isRead: true }));
}

export function clearNotifications() {
  notificationsTable = [];
}

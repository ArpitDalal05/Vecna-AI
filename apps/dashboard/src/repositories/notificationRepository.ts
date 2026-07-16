import { INotificationRepository, RepoResponse } from "./interfaces";
import { notificationsTable, NotificationRow, markAllNotificationsRead, clearNotifications } from "../mock/notifications";
import { cacheManager } from "../services/cache/cacheManager";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class NotificationRepository implements INotificationRepository {
  async getNotifications(): Promise<RepoResponse<NotificationRow[]>> {
    const cacheKey = "notifications_list";
    const cached = cacheManager.get<NotificationRow[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(100 + Math.random() * 100);
    try {
      const data = [...notificationsTable];
      cacheManager.set(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (err: any) {
      return { data: null, error: err, loading: false };
    }
  }

  async markAllRead(): Promise<{ error: Error | null }> {
    await delay(100);
    try {
      markAllNotificationsRead();
      cacheManager.invalidate("notifications_list");
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }

  async clear(): Promise<{ error: Error | null }> {
    await delay(100);
    try {
      clearNotifications();
      cacheManager.invalidate("notifications_list");
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }
}

export const notificationRepository = new NotificationRepository();
export default notificationRepository;

import { INotificationRepository, RepoResponse } from "./interfaces";
import { notificationsTable, NotificationRow, markAllNotificationsRead, clearNotifications } from "../mock/notifications";
import { cacheManager } from "../services/cache/cacheManager";
import { FEATURE_FLAGS } from "../config";
import { createClient } from "../lib/supabase/client";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class NotificationRepository implements INotificationRepository {
  async getNotifications(): Promise<RepoResponse<NotificationRow[]>> {
    const cacheKey = "notifications_list";
    const cached = cacheManager.get<NotificationRow[]>(cacheKey);
    if (cached) {
      return { data: cached, error: null, loading: false };
    }

    await delay(100 + Math.random() * 100);

    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        const data = [...notificationsTable];
        cacheManager.set(cacheKey, data);
        return { data, error: null, loading: false };
      } catch (err: any) {
        return { data: null, error: err, loading: false };
      }
    } else {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("notifications").select("*");
        if (error) throw new Error(error.message);

        const mapped: NotificationRow[] = (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          message: row.message,
          type: row.type,
          isRead: row.is_read,
          timestamp: row.timestamp
        }));

        cacheManager.set(cacheKey, mapped);
        return { data: mapped, error: null, loading: false };
      } catch (err: any) {
        console.warn("Supabase fetch failed, falling back to mock notifications:", err);
        return { data: [...notificationsTable], error: null, loading: false };
      }
    }
  }

  async markAllRead(): Promise<{ error: Error | null }> {
    await delay(100);
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        markAllNotificationsRead();
        cacheManager.invalidate("notifications_list");
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    } else {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
        if (error) throw error;
        cacheManager.invalidate("notifications_list");
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    }
  }

  async clear(): Promise<{ error: Error | null }> {
    await delay(100);
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      try {
        clearNotifications();
        cacheManager.invalidate("notifications_list");
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    } else {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) throw error;
        cacheManager.invalidate("notifications_list");
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    }
  }
}

export const notificationRepository = new NotificationRepository();
export default notificationRepository;

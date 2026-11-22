
import { apiRequest } from "@/lib/api";

import type {
  Notification,
  NotificationListParams,
} from "./types";

export async function getNotifications(
  token: string,
  params: NotificationListParams = {}
): Promise<Notification[]> {
  const { skip = 0, limit = 50 } = params;

  const queryParams = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });

  return apiRequest<Notification[]>(
    `/notifications/?${queryParams.toString()}`,
    {
      method: "GET",
      token,
    }
  );
}

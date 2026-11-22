
export type NotificationType =
  | "credit_added"
  | "payment_received"
  | "balance_updated"
  | "payment_reminder";

export type NotificationStatus =
  | "pending"
  | "sent"
  | "failed";

export interface Notification {
  id: string;
  customer_id: string;
  transaction_id: string | null;
  notification_type: NotificationType;
  message: string;
  status: NotificationStatus;
  sent_at: string | null;
  created_at: string;
}

export interface NotificationListParams {
  skip?: number;
  limit?: number;
}

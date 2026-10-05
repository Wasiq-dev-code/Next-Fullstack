export type NotificationLevel = 'ALL' | 'NONE';

export interface NotificationItem {
  _id: string;
  type: 'NEW_VIDEO';
  video?: string;
  title: string;
  thumbnailUrl?: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    _id: string;
    username: string;
    profilePhoto?: { url?: string };
  } | null;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  nextCursor: string | null;
}
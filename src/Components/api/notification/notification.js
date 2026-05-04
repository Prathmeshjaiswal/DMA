import api from "../client";

// ✅ Get notifications
export const getNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

// ✅ Mark single notification read
export const markNotificationRead = async (id) => {
  await api.put(`/notifications/${id}/read`);
};

// ✅ Mark all notifications read
export const markAllNotificationsRead = async () => {
  await api.post("/notifications/read-all");
};


export const getUnreadCount = async () => {
  const res = await api.get("/notifications/unread-count");
  return res.data;
};
const KEY = "avasya_notifications_enabled";

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationsEnabled() {
  if (!notificationsSupported()) return false;
  return Notification.permission === "granted" && localStorage.getItem(KEY) !== "off";
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  let perm = Notification.permission;
  if (perm === "default") {
    perm = await Notification.requestPermission();
  }
  if (perm === "granted") {
    localStorage.setItem(KEY, "on");
    notify("Bildirimler açıldı", "Teklif güncellemeleri masaüstünüze gelecek.");
    return true;
  }
  return false;
}

export function notify(title: string, body: string) {
  if (!notificationsEnabled()) return;
  try {
    new Notification(title, { body, icon: "/app-icon-192.png", badge: "/app-icon-192.png" });
  } catch {
    // ignore
  }
}

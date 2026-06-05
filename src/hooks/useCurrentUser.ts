import { useEffect, useState } from "react";

const KEY = "avasya_current_user";

export function getCurrentUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setCurrentUser(name: string | null) {
  if (typeof window === "undefined") return;
  if (name) localStorage.setItem(KEY, name);
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("avasya-user-change"));
}

export function useCurrentUser() {
  const [user, setUser] = useState<string | null>(() => getCurrentUser());
  useEffect(() => {
    const handler = () => setUser(getCurrentUser());
    window.addEventListener("avasya-user-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("avasya-user-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return user;
}

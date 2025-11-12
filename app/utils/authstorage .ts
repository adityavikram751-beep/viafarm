// utils/auth.ts
import Cookies from "js-cookie";

const AUTH_KEY = "via-farm-auth"; // localStorage key
const COOKIE_KEY = "viafarm_token"; // cookie key

/* 🔒 Save token to localStorage + secure cookie (works on Vercel too) */
export function setToken(token: string): void {
  try {
    if (typeof window !== "undefined") {
      // Save in localStorage (for client use)
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token }));

      // Save in cookie (for refresh & SSR compatibility)
      Cookies.set(COOKIE_KEY, token, {
        expires: 7,          // valid for 7 days
        path: "/",           // accessible site-wide
        secure: true,        // ✅ required for Vercel (HTTPS)
        sameSite: "strict",  // prevents external site access
      });
    }
  } catch (error) {
    console.error("Error saving token:", error);
  }
}

/* 🔓 Get token (prefer cookie first, fallback to localStorage) */
export function getToken(): string | null {
  try {
    if (typeof window !== "undefined") {
      const cookieToken = Cookies.get(COOKIE_KEY);
      if (cookieToken) return cookieToken;

      const data = localStorage.getItem(AUTH_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed?.token || null;
    }
    return null;
  } catch (error) {
    console.error("Error reading token:", error);
    return null;
  }
}

/* 🧹 Clear token from both localStorage & cookie (logout) */
export function clearToken(): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_KEY);
      Cookies.remove(COOKIE_KEY, { path: "/" });
    }
  } catch (error) {
    console.error("Error clearing token:", error);
  }
}

/* ⚙️ Return Axios Auth Config */
export function getAuthConfig() {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
}

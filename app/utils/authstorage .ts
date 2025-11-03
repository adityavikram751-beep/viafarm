// utils/auth.ts

const AUTH_KEY = "via-farm-auth";

/* 🔒 Save token to localStorage */
export function setToken(token: string): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token }));
    }
  } catch (error) {
    console.error("Error saving token:", error);
  }
}

/* 🔓 Get token from localStorage */
export function getToken(): string | null {
  try {
    if (typeof window !== "undefined") {
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

/* 🧹 Clear token from localStorage (logout) */
export function clearToken(): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_KEY);
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

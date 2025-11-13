 const AUTH_KEY = "viafarm_admin_token";

/* SAVE TOKEN */
export function setToken(token: string) {
  if (typeof window !== "undefined") {
    // Save plain string
    localStorage.setItem(AUTH_KEY, token);
  }
}

/* GET TOKEN */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_KEY);
  }
  return null;
}

/* CLEAR TOKEN */
export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

/* AUTH HEADER FOR AXIOS */
export function getAuthConfig() {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
}

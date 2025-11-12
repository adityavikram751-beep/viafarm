
import Cookies from "js-cookie";

const AUTH_KEY = "via-farm-auth"; 
const COOKIE_KEY = "viafarm_token";


export function setToken(token: string): void {
  try {
    if (typeof window !== "undefined") {
      
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token }));

     
      Cookies.set(COOKIE_KEY, token, {
        expires: 7,          
        path: "/",           
        secure: true,        
        sameSite: "strict",  
      });
    }
  } catch (error) {
    console.error("Error saving token:", error);
  }
}


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


export function getAuthConfig() {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
}

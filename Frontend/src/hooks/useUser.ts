import { useEffect, useState } from "react";
import api from "../utils/api";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: "User" | "Admin";
  createdAtUtc?: string;
};

type AuthOk = { ok: true; user: AppUser };
type AuthFail = { ok: false; message: string };
type AuthResult = AuthOk | AuthFail;

const TOKEN_KEY = "token";

const setAuthHeader = (token?: string) => {
  if (!api?.defaults?.headers) return;
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  setAuthHeader(token);
};

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  setAuthHeader(undefined);
};

export const useUser = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // normalize /api/auth/me payload
  const toUser = (data: any): AppUser => ({
    id: data.id ?? data.userId ?? "",
    email: data.email,
    name: data.name ?? data.displayName ?? "",
    role: data.role ?? "User",
    createdAtUtc: data.createdAtUtc,
  });

  const fetchMe = async (): Promise<AppUser> => {
    const res = await api.get("/auth/me"); // baseURL likely has '/api'
    const user = toUser(res.data);
    setCurrentUser(user);
    return user;
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      // backend returns token + basic user info
      const token: string = res.data.token;
      if (token) saveToken(token);
      // get canonical user shape
      const user = await fetchMe().catch(() => {
        // fallback if /me not available for some reason
        return toUser({
          id: res.data.userId,
          email: res.data.email ?? email,
          name: res.data.name ?? res.data.displayName ?? name,
          role: res.data.role ?? "User",
        });
      });
      setCurrentUser(user);
      return { ok: true, user };
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Registration failed";
      setError(msg);
      clearToken();
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log("Login response:", res.data);
      const token: string = res.data.token;
      if (token) saveToken(token);
      const user = await fetchMe();
      return { ok: true, user };
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Login failed";
      setError(msg);
      clearToken();
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    clearToken();
    setCurrentUser(null);
  };

  // bootstrap from stored token
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      setAuthHeader(token);
      fetchMe().catch(() => {
        clearToken();
        setCurrentUser(null);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    currentUser,
    loading,
    error,
    isAuthenticated: !!currentUser,
    registerUser,
    loginUser,
    logoutUser,
    refreshMe: fetchMe,
  };
};

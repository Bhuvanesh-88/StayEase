import type { UserRole } from "../types/models";

export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

export const saveAuth = (token: string, user: AuthUser) => {
  localStorage.setItem("token", token);
  localStorage.setItem("auth", JSON.stringify(user));
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const getAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem("auth");
  return raw ? JSON.parse(raw) : null;
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("auth");
};
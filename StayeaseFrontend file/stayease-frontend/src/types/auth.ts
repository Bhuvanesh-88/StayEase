import type { UserRole } from "./models";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Exclude<UserRole, "ADMIN">;
}

export interface LoginResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}
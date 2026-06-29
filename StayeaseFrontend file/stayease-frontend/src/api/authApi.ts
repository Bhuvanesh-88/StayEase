import axiosClient from "./axiosClient";
import type { LoginRequest, LoginResponse, RegisterRequest } from "../types/auth";

export const loginUser = async (payload: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axiosClient.post<LoginResponse>("/auth/login", payload);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const registerUser = async (payload: RegisterRequest) => {
  const response = await axiosClient.post("/auth/register", payload);
  return response.data; // UserResponse
};

export const getUserById = async (userId: number) => {
  try {
    const response = await axiosClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
};
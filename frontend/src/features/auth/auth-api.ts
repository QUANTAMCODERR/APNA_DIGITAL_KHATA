
import { apiRequest } from "@/lib/api";

import type {
  UserLogin,
  UserRegister,
  UserResponse,
  TokenResponse,
} from "./types";

export async function registerUser(
  data: UserRegister
): Promise<UserResponse> {
  return apiRequest<UserResponse>("/auth/register", {
    method: "POST",
    body: data,
  });
}

export async function loginUser(
  data: UserLogin
): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    body: data,
  });
}

export async function getCurrentUser(
  token: string
): Promise<UserResponse> {
  return apiRequest<UserResponse>("/auth/me", {
    method: "GET",
    token,
  });
}



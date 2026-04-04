import apiClient from "./client";
import { LoginRequest, LoginResponse, LinkTokenPayload, User } from "../types/auth.types";

export async function verifyLinkToken(lt: string): Promise<LinkTokenPayload> {
  const { data } = await apiClient.get<LinkTokenPayload>("/auth/verify-link-token", {
    params: { lt },
  });
  return data;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export function logout() {
  localStorage.removeItem("vs_session_token");
  localStorage.removeItem("vs_user");
  window.location.href = "/login";
}

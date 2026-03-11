import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserProfile,
} from "../types";
import { api } from "./client";

export const authApi = {
  register(data: RegisterRequest): Promise<TokenResponse> {
    return api.post<TokenResponse>("/api/v1/auth/register", data);
  },

  login(data: LoginRequest): Promise<TokenResponse> {
    return api.post<TokenResponse>("/api/v1/auth/login", data);
  },

  getProfile(token: string): Promise<UserProfile> {
    return api.get<UserProfile>("/api/v1/auth/me", { token });
  },
};

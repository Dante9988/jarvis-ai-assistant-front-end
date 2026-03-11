export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  timezone: string;
  proactive_enabled: boolean;
}

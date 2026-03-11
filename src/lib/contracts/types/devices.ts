import { DeviceType } from "./enums";

export interface DeviceRegisterRequest {
  name: string;
  device_type: DeviceType;
  platform?: string;
  capabilities?: Record<string, unknown>;
}

export interface DeviceRegisterResponse {
  device_id: string;
  device_token: string;
  message: string;
}

export interface DeviceResponse {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  device_type: DeviceType;
  platform: string | null;
  is_active: boolean;
  capabilities: Record<string, unknown> | null;
  permissions: Record<string, unknown> | null;
  last_seen_at: string | null;
}

export interface DeviceListResponse {
  devices: DeviceResponse[];
}

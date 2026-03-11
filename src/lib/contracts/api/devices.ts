import type { DeviceListResponse, DeviceResponse } from "../types";
import { api } from "./client";

export const devicesApi = {
  list(token: string): Promise<DeviceListResponse> {
    return api.get<DeviceListResponse>("/api/v1/devices", { token });
  },

  get(deviceId: string, token: string): Promise<DeviceResponse> {
    return api.get<DeviceResponse>(`/api/v1/devices/${deviceId}`, { token });
  },

  deactivate(deviceId: string, token: string): Promise<void> {
    return api.delete(`/api/v1/devices/${deviceId}`, { token });
  },
};

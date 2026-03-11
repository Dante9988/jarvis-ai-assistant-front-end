"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devicesApi } from "@/lib/contracts/api";
import { getToken } from "@/lib/auth";

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: () => devicesApi.list(getToken()!),
  });
}

export function useDeactivateDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) => devicesApi.deactivate(deviceId, getToken()!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }),
  });
}

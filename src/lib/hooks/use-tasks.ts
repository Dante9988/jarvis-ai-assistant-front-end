"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/contracts/api";
import { getToken } from "@/lib/auth";
import type { TaskCreateRequest, TaskUpdateRequest } from "@/lib/contracts/types";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.list(getToken()!),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskCreateRequest) => tasksApi.create(data, getToken()!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: TaskUpdateRequest;
    }) => tasksApi.update(id, data, getToken()!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

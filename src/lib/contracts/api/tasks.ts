import type {
  TaskCreateRequest,
  TaskListResponse,
  TaskResponse,
  TaskUpdateRequest,
} from "../types";
import { api } from "./client";

export const tasksApi = {
  create(data: TaskCreateRequest, token: string): Promise<TaskResponse> {
    return api.post<TaskResponse>("/api/v1/tasks", data, { token });
  },

  list(token: string): Promise<TaskListResponse> {
    return api.get<TaskListResponse>("/api/v1/tasks", { token });
  },

  get(taskId: string, token: string): Promise<TaskResponse> {
    return api.get<TaskResponse>(`/api/v1/tasks/${taskId}`, { token });
  },

  update(
    taskId: string,
    data: TaskUpdateRequest,
    token: string,
  ): Promise<TaskResponse> {
    return api.patch<TaskResponse>(`/api/v1/tasks/${taskId}`, data, {
      token,
    });
  },
};

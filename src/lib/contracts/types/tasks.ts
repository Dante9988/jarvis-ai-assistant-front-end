import { TaskPriority, TaskStatus } from "./enums";

export interface TaskCreateRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_at?: string;
  tags?: Record<string, unknown>;
  requires_approval?: boolean;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_at?: string;
  tags?: Record<string, unknown>;
}

export interface TaskResponse {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  completed_at: string | null;
  source_device_id: string | null;
  tags: Record<string, unknown> | null;
  requires_approval: boolean;
}

export interface TaskListResponse {
  tasks: TaskResponse[];
}

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  WAITING_APPROVAL = "waiting_approval",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum DeviceType {
  PHONE = "phone",
  LAPTOP = "laptop",
  DESKTOP = "desktop",
  BROWSER = "browser",
  CLI = "cli",
  IOT = "iot",
  OTHER = "other",
}

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export enum MemoryType {
  SHORT_TERM = "short_term",
  LONG_TERM = "long_term",
  PROJECT = "project",
  PREFERENCE = "preference",
  FACT = "fact",
}

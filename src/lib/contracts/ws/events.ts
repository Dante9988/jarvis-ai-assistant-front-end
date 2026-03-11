/** Frames sent from server to client */
export type ServerFrame =
  | AuthOkFrame
  | ResponseFrame
  | VoiceResponseFrame
  | ProactiveFrame
  | CommandFrame
  | HeartbeatAckFrame
  | ErrorFrame;

export interface AuthOkFrame {
  type: "auth_ok";
  device_id: string;
}

export interface ResponseFrame {
  type: "response";
  conversation_id: string;
  content: string;
  provider: string;
  model: string;
  follow_up: string | null;
}

export interface VoiceResponseFrame {
  type: "voice_response";
  transcript: string;
  content: string;
  conversation_id: string;
  audio?: string;
}

export interface ProactiveFrame {
  type: "proactive";
  content: string;
  priority: number;
}

export interface CommandFrame {
  type: "command";
  call_id: string;
  tool: string;
  arguments: Record<string, unknown>;
}

export interface HeartbeatAckFrame {
  type: "heartbeat_ack";
}

export interface ErrorFrame {
  type: "error";
  detail: string;
}

/** Frames sent from client to server */
export type ClientFrame =
  | AuthFrame
  | MessageFrame
  | VoiceFrame
  | HeartbeatFrame
  | CapabilityFrame
  | ToolResultFrame;

export interface AuthFrame {
  type: "auth";
  token: string;
}

export interface MessageFrame {
  type: "message";
  content: string;
  conversation_id?: string;
  provider?: string;
  model?: string;
}

export interface VoiceFrame {
  type: "voice";
  audio: string;
  conversation_id?: string;
}

export interface HeartbeatFrame {
  type: "heartbeat";
}

export interface CapabilityFrame {
  type: "capability";
  capabilities: string[];
  platform: string;
  agent_version: string;
}

export interface ToolResultFrame {
  type: "tool_result";
  call_id: string;
  tool: string;
  status: "completed" | "failed" | "timeout";
  output?: string;
  error?: string;
}

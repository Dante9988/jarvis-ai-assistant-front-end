import { MessageRole } from "./enums";

export interface SendMessageRequest {
  message: string;
  conversation_id?: string;
  device_id?: string;
  provider?: string;
  model?: string;
}

export interface MessageResponse {
  id: string;
  created_at: string;
  updated_at: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  provider: string | null;
  model: string | null;
}

export interface ConversationResponse {
  id: string;
  created_at: string;
  updated_at: string;
  title: string | null;
  is_active: boolean;
  messages: MessageResponse[];
}

export interface ConversationListResponse {
  conversations: ConversationResponse[];
}

export interface JarvisResponse {
  conversation_id: string;
  reply: string;
  provider: string;
  model: string;
  follow_up: string | null;
}

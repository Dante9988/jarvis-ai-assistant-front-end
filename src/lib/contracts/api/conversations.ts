import type {
  ConversationListResponse,
  ConversationResponse,
  JarvisResponse,
  SendMessageRequest,
} from "../types";
import { api } from "./client";

export const conversationsApi = {
  sendMessage(
    data: SendMessageRequest,
    token: string,
  ): Promise<JarvisResponse> {
    return api.post<JarvisResponse>(
      "/api/v1/conversations/message",
      data,
      { token },
    );
  },

  list(token: string): Promise<ConversationListResponse> {
    return api.get<ConversationListResponse>("/api/v1/conversations", {
      token,
    });
  },

  get(conversationId: string, token: string): Promise<ConversationResponse> {
    return api.get<ConversationResponse>(
      `/api/v1/conversations/${conversationId}`,
      { token },
    );
  },
};

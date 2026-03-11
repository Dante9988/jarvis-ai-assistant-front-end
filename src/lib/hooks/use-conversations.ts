"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationsApi } from "@/lib/contracts/api";
import { getToken } from "@/lib/auth";
import type { SendMessageRequest } from "@/lib/contracts/types";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationsApi.list(getToken()!),
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => conversationsApi.get(id!, getToken()!),
    enabled: !!id,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      conversationsApi.sendMessage(data, getToken()!),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({
        queryKey: ["conversation", res.conversation_id],
      });
    },
  });
}

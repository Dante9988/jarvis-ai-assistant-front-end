"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendVoiceMessage } from "@/lib/contracts/api";
import { getToken } from "@/lib/auth";

export function useVoiceMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      audioBlob,
      conversationId,
    }: {
      audioBlob: Blob;
      conversationId?: string;
    }) =>
      sendVoiceMessage(audioBlob, getToken()!, {
        conversationId: conversationId || undefined,
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({
        queryKey: ["conversation", data.conversation_id],
      });
    },
  });
}

/**
 * Play base64-encoded audio (e.g. from voice API response).
 * Returns a promise that resolves when playback ends or rejects on error.
 */
export function playBase64Audio(base64: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64}`);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Audio playback failed"));
    audio.play().catch(reject);
  });
}

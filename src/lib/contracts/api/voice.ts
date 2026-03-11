import { getBaseUrl } from "./client";
import { ApiError } from "./client";
import type { VoiceMessageResponse } from "../types";

/**
 * Send voice audio to Jarvis. Backend transcribes (Whisper), runs Orchestrator,
 * then returns transcript + text reply + TTS audio (base64).
 */
export async function sendVoiceMessage(
  audioBlob: Blob,
  token: string,
  options: { conversationId?: string } = {},
): Promise<VoiceMessageResponse> {
  const url = `${getBaseUrl()}/api/v1/voice/message`;
  const form = new FormData();
  form.append("audio", audioBlob, "audio.webm");

  if (options.conversationId) {
    form.append("conversation_id", options.conversationId);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail =
      data?.detail ?? data?.message ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, detail, data);
  }

  return data as VoiceMessageResponse;
}

export interface VoiceMessageResponse {
  transcript: string;
  reply: string;
  conversation_id: string;
  audio_base64: string | null;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, Plus, MessageSquare, Loader2, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useConversations,
  useConversation,
  useSendMessage,
  useVoiceMessage,
  playBase64Audio,
} from "@/lib/hooks";
import { MessageRole } from "@/lib/contracts/types";
import { EmptyState } from "@/components/shared/empty-state";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams.get("id");
  const conversations = useConversations();
  const conversation = useConversation(selectedId);
  const sendMessage = useSendMessage();
  const voiceMessage = useVoiceMessage();

  const [input, setInput] = useState("");
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation.data?.messages]);

  useEffect(() => {
    if (sendMessage.data?.follow_up) {
      setFollowUp(sendMessage.data.follow_up);
    }
  }, [sendMessage.data]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;
    setFollowUp(null);
    sendMessage.mutate(
      {
        message: trimmed,
        conversation_id: selectedId ?? undefined,
      },
      {
        onSuccess: (res) => {
          if (!selectedId) {
            router.replace(`/chat?id=${res.conversation_id}`);
          }
        },
      },
    );
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        const blob =
          chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type: mimeType })
            : null;
        if (blob && blob.size > 0) {
          voiceMessage.mutate(
            { audioBlob: blob, conversationId: selectedId ?? undefined },
            {
              onSuccess: (data) => {
                if (!selectedId)
                  router.replace(`/chat?id=${data.conversation_id}`);
                if (data.audio_base64) {
                  playBase64Audio(data.audio_base64).catch(() => {});
                }
              },
            },
          );
        }
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access failed:", err);
    }
  }, [selectedId, voiceMessage, router]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const isPending = sendMessage.isPending || voiceMessage.isPending;

  return (
    <div className="mx-auto flex h-full max-w-6xl gap-4">
      {/* Sidebar */}
      <div className="hidden w-64 shrink-0 flex-col rounded-xl border border-border bg-card lg:flex">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-medium">Conversations</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => router.push("/chat")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {conversations.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))
              : conversations.data?.conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => router.push(`/chat?id=${conv.id}`)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      selectedId === conv.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50",
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {conv.title ?? "Untitled"}
                    </span>
                  </button>
                ))}
          </div>
        </ScrollArea>
      </div>

      {/* Thread */}
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card">
        {!selectedId && !isPending ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="Start a conversation"
              description="Send a message to Jarvis using the composer below."
            />
          </div>
        ) : (
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="mx-auto max-w-2xl space-y-4">
              {conversation.isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                      <Skeleton className="h-16 w-64 rounded-2xl" />
                    </div>
                  ))
                : conversation.data?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === MessageRole.USER ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          msg.role === MessageRole.USER
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground",
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}

              {(sendMessage.isPending || voiceMessage.isPending) && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {voiceMessage.isPending
                        ? "Jarvis is listening and replying..."
                        : "Jarvis is thinking..."}
                    </span>
                  </div>
                </div>
              )}

              {followUp && (
                <div className="flex justify-start">
                  <button
                    onClick={() => {
                      setInput(followUp);
                      setFollowUp(null);
                    }}
                    className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-left text-sm text-primary transition-colors hover:bg-primary/10"
                  >
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-primary/70">
                      Suggested follow-up
                    </span>
                    {followUp}
                  </button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Composer */}
        <div className="border-t border-border p-4">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Jarvis... or use the mic to speak"
              className="min-h-[44px] max-h-32 resize-none rounded-xl bg-background"
              rows={1}
            />
            <Button
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              className={cn(
                "h-[44px] w-[44px] shrink-0 rounded-xl",
                isRecording && "animate-pulse",
              )}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isPending}
              title={isRecording ? "Stop recording" : "Voice message"}
            >
              {isRecording ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              className="h-[44px] w-[44px] shrink-0 rounded-xl"
              onClick={handleSend}
              disabled={!input.trim() || isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {(sendMessage.isError || voiceMessage.isError) && (
            <p className="mx-auto mt-2 max-w-2xl text-xs text-destructive">
              {voiceMessage.isError
                ? "Voice failed. Check mic permission and try again."
                : "Failed to send message. Please try again."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

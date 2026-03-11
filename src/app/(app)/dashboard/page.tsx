"use client";

import Link from "next/link";
import {
  MessageSquare,
  CheckSquare,
  Monitor,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/auth";
import { useConversations, useTasks, useDevices } from "@/lib/hooks";
import { useWebSocket } from "@/lib/providers/ws-provider";
import { TaskStatus } from "@/lib/contracts/types";

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  loading,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  loading?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-accent/30">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            {loading ? (
              <Skeleton className="mb-1 h-6 w-10" />
            ) : (
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
            )}
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const conversations = useConversations();
  const tasks = useTasks();
  const devices = useDevices();
  const { proactiveMessages } = useWebSocket();

  const pendingCount =
    tasks.data?.tasks.filter(
      (t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS,
    ).length ?? 0;

  const greeting = getGreeting();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {user?.display_name ?? user?.username}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending tasks"
          value={pendingCount}
          icon={CheckSquare}
          href="/tasks"
          loading={tasks.isLoading}
        />
        <StatCard
          label="Conversations"
          value={conversations.data?.conversations.length ?? 0}
          icon={MessageSquare}
          href="/chat"
          loading={conversations.isLoading}
        />
        <StatCard
          label="Connected devices"
          value={devices.data?.devices.filter((d) => d.is_active).length ?? 0}
          icon={Monitor}
          href="/devices"
          loading={devices.isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Proactive Updates</CardTitle>
          </CardHeader>
          <CardContent>
            {proactiveMessages.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No proactive updates yet. Jarvis will surface important things here.
              </p>
            ) : (
              <div className="space-y-3">
                {proactiveMessages.slice(0, 5).map((msg, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-border/50 bg-accent/20 p-3"
                  >
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <Badge variant="outline" className="mt-1.5 text-[10px]">
                        Priority: {msg.priority.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">Recent Conversations</CardTitle>
            </div>
            <Link href="/chat">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {conversations.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : !conversations.data?.conversations.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No conversations yet. Start one in the Chat tab.
              </p>
            ) : (
              <div className="space-y-2">
                {conversations.data.conversations.slice(0, 4).map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/chat?id=${conv.id}`}
                    className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent/40"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">
                        {conv.title ?? "Untitled conversation"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.messages.length} messages
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Link href="/chat">
          <Button size="lg" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Talk to Jarvis
          </Button>
        </Link>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { useAuthStore } from "@/lib/auth";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Manage your Jarvis preferences." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={user?.username ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={user?.display_name ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input value={user?.timezone ?? "UTC"} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proactive Features</CardTitle>
          <CardDescription>
            Control how Jarvis reaches out to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Proactive Messages</p>
              <p className="text-xs text-muted-foreground">
                Morning briefs, reminders, and nudges.
              </p>
            </div>
            <Badge variant={user?.proactive_enabled ? "default" : "secondary"}>
              {user?.proactive_enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Quiet Hours</Label>
            <p className="text-xs text-muted-foreground">
              Configured on the backend. Non-urgent messages are suppressed during quiet hours.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Provider</CardTitle>
          <CardDescription>LLM and voice preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Provider</Label>
            <Select defaultValue="openai" disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Provider selection is managed server-side. Per-request override coming soon.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select defaultValue="alloy" disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alloy">Alloy</SelectItem>
                <SelectItem value="echo">Echo</SelectItem>
                <SelectItem value="nova">Nova</SelectItem>
                <SelectItem value="shimmer">Shimmer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Voice preference. Voice input coming in a future release.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { format } from "date-fns";
import {
  Monitor,
  Smartphone,
  Laptop,
  Globe,
  Terminal,
  Cpu,
  HardDrive,
  Power,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingList } from "@/components/shared/loading-card";
import { useDevices, useDeactivateDevice } from "@/lib/hooks";
import { DeviceType } from "@/lib/contracts/types";
import type { DeviceResponse } from "@/lib/contracts/types";
import { cn } from "@/lib/utils";

const deviceIcons: Record<DeviceType, React.ElementType> = {
  [DeviceType.PHONE]: Smartphone,
  [DeviceType.LAPTOP]: Laptop,
  [DeviceType.DESKTOP]: Monitor,
  [DeviceType.BROWSER]: Globe,
  [DeviceType.CLI]: Terminal,
  [DeviceType.IOT]: Cpu,
  [DeviceType.OTHER]: HardDrive,
};

function DeviceRow({ device }: { device: DeviceResponse }) {
  const deactivate = useDeactivateDevice();
  const Icon = deviceIcons[device.device_type] ?? HardDrive;
  const capCount = device.capabilities
    ? Object.keys(device.capabilities).length
    : 0;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-accent/20">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          device.is_active ? "bg-primary/10" : "bg-muted",
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            device.is_active ? "text-primary" : "text-muted-foreground",
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{device.name}</p>
          <Badge variant={device.is_active ? "default" : "secondary"} className="text-[10px]">
            {device.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="capitalize">{device.device_type}</span>
          {device.platform && <span>{device.platform}</span>}
          {capCount > 0 && <span>{capCount} capabilities</span>}
          {device.last_seen_at && (
            <span>Seen {format(new Date(device.last_seen_at), "MMM d, h:mm a")}</span>
          )}
        </div>
      </div>
      {device.is_active && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => deactivate.mutate(device.id)}
          disabled={deactivate.isPending}
        >
          <Power className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function DevicesPage() {
  const devices = useDevices();
  const deviceList = devices.data?.devices ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Devices"
        description="Manage your connected device agents."
      />

      {devices.isLoading ? (
        <LoadingList count={3} />
      ) : deviceList.length === 0 ? (
        <EmptyState
          icon={Monitor}
          title="No devices registered"
          description="Register a device agent to connect it with Jarvis."
        />
      ) : (
        <div className="space-y-3">
          {deviceList.map((d) => (
            <DeviceRow key={d.id} device={d} />
          ))}
        </div>
      )}
    </div>
  );
}

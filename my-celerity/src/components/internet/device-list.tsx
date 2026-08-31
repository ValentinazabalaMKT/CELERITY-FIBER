"use client";

import { useState } from "react";
import {
  Cast,
  Gamepad2,
  Laptop,
  MoreVertical,
  Pause,
  Play,
  Router,
  Smartphone,
  Speaker,
  Star,
  Tablet,
  type LucideIcon,
} from "lucide-react";
import type { Device, DeviceType } from "@/types";
import { formatRelativeTime, cn } from "@/lib/utils";
import { prioritizeDevice, renameDevice, toggleDevicePause } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";

const deviceIcons: Record<DeviceType, LucideIcon> = {
  laptop: Laptop,
  phone: Smartphone,
  tv: Cast,
  console: Gamepad2,
  speaker: Speaker,
  tablet: Tablet,
  other: Router,
};

export function DeviceList({ accountId, devices: initial }: { accountId: string; devices: Device[] }) {
  const [devices, setDevices] = useState(initial);
  const [renaming, setRenaming] = useState<Device | null>(null);
  const [nameDraft, setNameDraft] = useState("");

  function update(id: string, patch: Partial<Device>) {
    setDevices((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  async function handlePause(device: Device) {
    update(device.id, { paused: !device.paused });
    await toggleDevicePause(accountId, device.id);
  }

  async function handlePrioritize(device: Device) {
    update(device.id, { prioritized: !device.prioritized });
    await prioritizeDevice(accountId, device.id);
  }

  function openRename(device: Device) {
    setRenaming(device);
    setNameDraft(device.name);
  }

  async function handleRenameSave() {
    if (!renaming) return;
    update(renaming.id, { name: nameDraft });
    await renameDevice(accountId, renaming.id, nameDraft);
    setRenaming(null);
  }

  return (
    <Card id="devices">
      <CardHeader>
        <CardTitle>Connected Devices</CardTitle>
        <CardDescription>{devices.filter((d) => d.status === "online").length} online now</CardDescription>
      </CardHeader>
      <CardContent>
        {devices.length === 0 ? (
          <EmptyState title="No devices connected" description="Devices will appear here once they connect to your network." />
        ) : (
          <ul className="divide-y divide-border">
            {devices.map((device) => {
              const Icon = deviceIcons[device.type];
              return (
                <li key={device.id} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full",
                      device.status === "online" ? "bg-success-bg text-success" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                      {device.name}
                      {device.prioritized && <Star className="size-3.5 fill-warning text-warning" />}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {device.connection} ·{" "}
                      {device.status === "online" ? "Active now" : `Last seen ${formatRelativeTime(device.lastActivity)}`}
                    </p>
                  </div>
                  {device.paused && <Badge variant="warning">Paused</Badge>}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Manage ${device.name}`}
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handlePause(device)}>
                        {device.paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                        {device.paused ? "Resume internet" : "Pause internet"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handlePrioritize(device)}>
                        <Star className="size-4" />
                        {device.prioritized ? "Remove priority" : "Prioritize device"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => openRename(device)}>Rename device</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <Dialog open={!!renaming} onOpenChange={(v) => !v && setRenaming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="device-name">Device name</Label>
              <Input id="device-name" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleRenameSave}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

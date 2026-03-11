"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, CheckSquare, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingList } from "@/components/shared/loading-card";
import { useTasks, useCreateTask, useUpdateTask } from "@/lib/hooks";
import { TaskStatus, TaskPriority } from "@/lib/contracts/types";
import type { TaskResponse } from "@/lib/contracts/types";
import { cn } from "@/lib/utils";

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(256),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  due_at: z.string().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  [TaskPriority.LOW]: { label: "Low", className: "text-muted-foreground border-muted" },
  [TaskPriority.MEDIUM]: { label: "Medium", className: "text-blue-400 border-blue-400/30" },
  [TaskPriority.HIGH]: { label: "High", className: "text-amber-400 border-amber-400/30" },
  [TaskPriority.URGENT]: { label: "Urgent", className: "text-red-400 border-red-400/30" },
};

const statusConfig: Record<TaskStatus, { label: string; icon: React.ElementType }> = {
  [TaskStatus.PENDING]: { label: "Pending", icon: Clock },
  [TaskStatus.IN_PROGRESS]: { label: "In Progress", icon: AlertTriangle },
  [TaskStatus.WAITING_APPROVAL]: { label: "Waiting Approval", icon: Clock },
  [TaskStatus.COMPLETED]: { label: "Completed", icon: CheckSquare },
  [TaskStatus.CANCELLED]: { label: "Cancelled", icon: CheckSquare },
};

function TaskRow({ task }: { task: TaskResponse }) {
  const updateTask = useUpdateTask();
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const isComplete =
    task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED;

  function cycleStatus() {
    const next =
      task.status === TaskStatus.PENDING
        ? TaskStatus.IN_PROGRESS
        : task.status === TaskStatus.IN_PROGRESS
          ? TaskStatus.COMPLETED
          : null;
    if (next) updateTask.mutate({ id: task.id, data: { status: next } });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-accent/20",
        isComplete && "opacity-60",
      )}
    >
      <button
        onClick={cycleStatus}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
          isComplete
            ? "border-primary/30 bg-primary/10"
            : "border-border hover:border-primary/50",
        )}
      >
        {isComplete && <CheckSquare className="h-4 w-4 text-primary" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", isComplete && "line-through")}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("text-[10px]", priority.className)}>
            {priority.label}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {status.label}
          </Badge>
          {task.due_at && (
            <span className="text-[11px] text-muted-foreground">
              Due {format(new Date(task.due_at), "MMM d, h:mm a")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const tasks = useTasks();
  const createTask = useCreateTask();
  const [open, setOpen] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { priority: TaskPriority.MEDIUM },
  });

  async function onSubmit(data: CreateFormData) {
    await createTask.mutateAsync({
      title: data.title,
      description: data.description || undefined,
      priority,
      due_at: data.due_at || undefined,
    });
    reset();
    setPriority(TaskPriority.MEDIUM);
    setOpen(false);
  }

  const taskList = tasks.data?.tasks ?? [];
  const pending = taskList.filter(
    (t) => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED,
  );
  const completed = taskList.filter(
    (t) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.CANCELLED,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Tasks"
        description="Manage your tasks and deadlines."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={<Button size="sm" className="gap-1.5" />}
            >
              <Plus className="h-4 w-4" />
              New Task
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea id="description" rows={3} {...register("description")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      defaultValue={TaskPriority.MEDIUM}
                      onValueChange={(v) => setPriority(v as TaskPriority)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TaskPriority).map((p) => (
                          <SelectItem key={p} value={p}>
                            {priorityConfig[p].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_at">Due Date</Label>
                    <Input id="due_at" type="datetime-local" {...register("due_at")} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Task"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {tasks.isLoading ? (
        <LoadingList count={4} />
      ) : taskList.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create your first task to start tracking your work."
          action={
            <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Active ({pending.length})
              </p>
              {pending.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Completed ({completed.length})
              </p>
              {completed.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

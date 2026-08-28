import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ExternalLink, ClipboardList } from "lucide-react";
import { toast } from "sonner";

interface AdminTask {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "completed";
  priority: "P0" | "P1" | "P2" | "P3";
  assignee: string | null;
  due_date: string | null;
  area: string | null;
  link: string | null;
  created_at: string;
}

const SECTIONS = [
  { key: "todo", label: "To Do", accent: "border-l-red-400", dot: "bg-red-400" },
  { key: "in_progress", label: "In Progress", accent: "border-l-amber-400", dot: "bg-amber-400" },
  { key: "completed", label: "Completed", accent: "border-l-emerald-400", dot: "bg-emerald-400" },
] as const;

const PRIORITY_STYLES: Record<AdminTask["priority"], string> = {
  P0: "bg-red-100 text-red-700 border-red-200",
  P1: "bg-orange-100 text-orange-700 border-orange-200",
  P2: "bg-blue-100 text-blue-700 border-blue-200",
  P3: "bg-slate-100 text-slate-600 border-slate-200",
};

const AREAS = ["Awards", "Auth", "Product", "Marketing", "Event", "Design", "Legal", "Sponsors", "Operations"];

const emptyDraft = {
  title: "",
  description: "",
  status: "todo" as AdminTask["status"],
  priority: "P2" as AdminTask["priority"],
  assignee: "",
  due_date: "",
  area: "",
  link: "",
};

// admin_tasks isn't in the generated types yet — cast around it
const tasksTable = () => (supabase as any).from("admin_tasks");

export const TasksPanel = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [viewStatus, setViewStatus] = useState<"all" | AdminTask["status"]>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");

  // Logged-in admin's display name, for the "My Tasks" view
  const { data: myProfile } = useQuery({
    queryKey: ["admin-tasks-me", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user!.id).single();
      return data as { full_name: string | null } | null;
    },
    enabled: !!user,
  });

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: async () => {
      const { data, error } = await tasksTable()
        .select("*")
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as AdminTask[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });

  const createTask = useMutation({
    mutationFn: async () => {
      const { error } = await tasksTable().insert({
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        status: draft.status,
        priority: draft.priority,
        assignee: draft.assignee.trim() || null,
        due_date: draft.due_date || null,
        area: draft.area || null,
        link: draft.link.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task created");
      setIsDialogOpen(false);
      setDraft(emptyDraft);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Could not create task: ${e.message}`),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AdminTask["status"] }) => {
      const { error } = await tasksTable().update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(`Update failed: ${e.message}`),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await tasksTable().delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(`Delete failed: ${e.message}`),
  });

  const isMine = (t: AdminTask) => {
    if (!t.assignee) return false;
    const me = (myProfile?.full_name || "").toLowerCase();
    const a = t.assignee.toLowerCase();
    return me.length > 0 && (me.includes(a) || a.includes(me.split(" ")[0]));
  };

  const assignees = useMemo(
    () => [...new Set((tasks || []).map((t) => t.assignee).filter(Boolean))] as string[],
    [tasks]
  );
  const areas = useMemo(
    () => [...new Set((tasks || []).map((t) => t.area).filter(Boolean))] as string[],
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    return (tasks || []).filter((t) => {
      if (assigneeFilter === "mine" && !isMine(t)) return false;
      if (assigneeFilter === "unassigned" && t.assignee) return false;
      if (assigneeFilter !== "all" && assigneeFilter !== "mine" && assigneeFilter !== "unassigned" && t.assignee !== assigneeFilter) return false;
      if (areaFilter !== "all" && t.area !== areaFilter) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, assigneeFilter, areaFilter, myProfile]);

  const grouped = useMemo(() => {
    const map: Record<string, AdminTask[]> = { todo: [], in_progress: [], completed: [] };
    filteredTasks.forEach((t) => map[t.status]?.push(t));
    return map;
  }, [filteredTasks]);

  const visibleSections = viewStatus === "all" ? SECTIONS : SECTIONS.filter((s) => s.key === viewStatus);

  const dueLabel = (t: AdminTask) => {
    if (!t.due_date) return null;
    const due = new Date(t.due_date + "T12:00:00");
    const days = Math.ceil((due.getTime() - Date.now()) / 86400000);
    const text = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (t.status === "completed") return <span className="text-slate-400">{text}</span>;
    if (days < 0) return <span className="text-red-600 font-semibold">{text} · overdue</span>;
    if (days <= 7) return <span className="text-red-500 font-medium">{text}</span>;
    if (days <= 21) return <span className="text-amber-600">{text}</span>;
    return <span className="text-slate-500">{text}</span>;
  };

  if (error) {
    return (
      <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
        <ClipboardList className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Tasks table not found</p>
        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Run the <code>admin_tasks</code> migration in the Supabase SQL editor to enable project management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Awards Runway</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Everything to get done before voting opens Oct 5 and the ceremony Nov 11
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* View filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: "all", label: "All" },
            { key: "todo", label: "To Dos" },
            { key: "in_progress", label: "In Progress" },
            { key: "completed", label: "Done" },
          ] as const
        ).map((v) => (
          <button
            key={v.key}
            onClick={() => setViewStatus(v.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              viewStatus === v.key
                ? "bg-slate-900 border-slate-900 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {v.label}
          </button>
        ))}
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <button
          onClick={() => setAssigneeFilter(assigneeFilter === "mine" ? "all" : "mine")}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            assigneeFilter === "mine"
              ? "bg-amber-500 border-amber-500 text-white"
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          My Tasks
        </button>
        <select
          value={assigneeFilter === "mine" ? "all" : assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-full px-3 py-1.5 bg-white text-slate-600"
        >
          <option value="all">All assignees</option>
          {assignees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
          <option value="unassigned">Unassigned</option>
        </select>
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-full px-3 py-1.5 bg-white text-slate-600"
        >
          <option value="all">All areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {(viewStatus !== "all" || assigneeFilter !== "all" || areaFilter !== "all") && (
          <button
            onClick={() => {
              setViewStatus("all");
              setAssigneeFilter("all");
              setAreaFilter("all");
            }}
            className="text-sm text-slate-400 hover:text-slate-600 underline"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Loading tasks...</div>
      ) : (
        visibleSections.map((section) => (
          <div key={section.key} className={`bg-white border border-slate-200 border-l-4 ${section.accent} rounded-lg`}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <span className={`w-2 h-2 rounded-full ${section.dot}`} />
              <h3 className="font-semibold text-slate-900">{section.label}</h3>
              <span className="text-xs text-slate-400">({grouped[section.key].length})</span>
            </div>
            {grouped[section.key].length === 0 ? (
              <p className="px-4 py-5 text-sm text-slate-400">Nothing here.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {grouped[section.key].map((t) => (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium ${t.status === "completed" ? "text-slate-400 line-through" : "text-slate-900"}`}>
                          {t.title}
                        </span>
                        <span className={`text-[11px] font-semibold border px-1.5 py-0.5 rounded ${PRIORITY_STYLES[t.priority]}`}>
                          {t.priority}
                        </span>
                        {t.area && (
                          <span className="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t.area}</span>
                        )}
                        {t.link && (
                          <a href={t.link} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{t.description}</p>
                      )}
                    </div>
                    {t.assignee && (
                      <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 whitespace-nowrap shrink-0">
                        {t.assignee}
                      </span>
                    )}
                    <span className="text-xs whitespace-nowrap shrink-0 w-24 text-right">{dueLabel(t)}</span>
                    <select
                      value={t.status}
                      onChange={(e) => updateStatus.mutate({ id: t.id, status: e.target.value as AdminTask["status"] })}
                      className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-600 shrink-0"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => deleteTask.mutate(t.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* New Task dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="What needs to be done?"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Add more details..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as AdminTask["status"] })}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={draft.priority}
                  onChange={(e) => setDraft({ ...draft, priority: e.target.value as AdminTask["priority"] })}
                >
                  <option value="P0">P0 — Critical</option>
                  <option value="P1">P1 — High</option>
                  <option value="P2">P2 — Normal</option>
                  <option value="P3">P3 — Low</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Assignee</Label>
                <Input
                  value={draft.assignee}
                  onChange={(e) => setDraft({ ...draft, assignee: e.target.value })}
                  placeholder="Name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={draft.due_date}
                  onChange={(e) => setDraft({ ...draft, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Area</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={draft.area}
                  onChange={(e) => setDraft({ ...draft, area: e.target.value })}
                >
                  <option value="">None</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Link (optional)</Label>
                <Input
                  value={draft.link}
                  onChange={(e) => setDraft({ ...draft, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createTask.mutate()} disabled={!draft.title.trim() || createTask.isPending}>
                {createTask.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ExternalLink, ClipboardList, Pencil } from "lucide-react";
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
  { key: "todo",        label: "To Do",       accent: "border-l-red-400",     dot: "bg-red-400",     textColor: "text-red-500"     },
  { key: "in_progress", label: "In Progress", accent: "border-l-amber-400",   dot: "bg-amber-400",   textColor: "text-amber-600"   },
  { key: "completed",   label: "Completed",   accent: "border-l-emerald-400", dot: "bg-emerald-400", textColor: "text-emerald-600" },
] as const;

const STATUS_STYLES: Record<AdminTask["status"], { bg: string; text: string; label: string }> = {
  todo:        { bg: "bg-gray-200",    text: "text-gray-600", label: "To Do"       },
  in_progress: { bg: "bg-amber-400",   text: "text-white",    label: "In Progress" },
  completed:   { bg: "bg-emerald-500", text: "text-white",    label: "Completed"   },
};

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

const tasksTable = () => (supabase as any).from("admin_tasks");

export const TasksPanel = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);
  const [viewStatus, setViewStatus] = useState<"all" | AdminTask["status"]>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");

  const { data: myProfile } = useQuery({
    queryKey: ["admin-tasks-me", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user!.id).single();
      return data as { full_name: string | null } | null;
    },
    enabled: !!user,
  });

  const { data: assigneeOptions } = useQuery({
    queryKey: ["admin-tasks-assignee-options"],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "moderator", "super_admin"] as any);
      const staffIds = [...new Set((roles || []).map((r) => r.user_id))];
      if (staffIds.length === 0) return [] as string[];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", staffIds);
      return [...new Set(
        (profiles || []).filter((p) => p.full_name).map((p) => p.full_name as string)
      )].sort();
    },
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

  const saveTask = useMutation({
    mutationFn: async () => {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        status: draft.status,
        priority: draft.priority,
        assignee: draft.assignee.trim() || null,
        due_date: draft.due_date || null,
        area: draft.area || null,
        link: draft.link.trim() || null,
      };
      const { error } = editingTask
        ? await tasksTable().update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editingTask.id)
        : await tasksTable().insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editingTask ? "Task updated" : "Task created");
      setIsDialogOpen(false);
      setEditingTask(null);
      setDraft(emptyDraft);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Could not save task: ${e.message}`),
  });

  const openEdit = (t: AdminTask) => {
    setEditingTask(t);
    setDraft({
      title: t.title,
      description: t.description || "",
      status: t.status,
      priority: t.priority,
      assignee: t.assignee || "",
      due_date: t.due_date || "",
      area: t.area || "",
      link: t.link || "",
    });
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingTask(null);
    setDraft(emptyDraft);
    setIsDialogOpen(true);
  };

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AdminTask["status"] }) => {
      const { error } = await tasksTable().update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(`Update failed: ${e.message}`),
  });

  const updateField = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: "assignee" | "due_date"; value: string | null }) => {
      const { error } = await tasksTable().update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", id);
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
    const a = t.assignee.toLowerCase().trim();
    const fullName = (myProfile?.full_name || "").toLowerCase().trim();
    const firstName = fullName.split(" ")[0];
    const emailLocal = (user?.email || "").split("@")[0].toLowerCase().trim();
    if (!fullName && !emailLocal) return false;
    return (
      (fullName.length > 0 && (a === fullName || a === firstName || fullName.includes(a) || a.includes(firstName))) ||
      (emailLocal.length > 0 && (a === emailLocal || a.includes(emailLocal) || emailLocal.includes(a)))
    );
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

  const dueColorClass = (t: AdminTask) => {
    if (!t.due_date || t.status === "completed") return "text-slate-400";
    const due = new Date(t.due_date + "T12:00:00");
    const days = Math.ceil((due.getTime() - Date.now()) / 86400000);
    if (days < 0) return "text-red-600 font-semibold";
    if (days <= 7) return "text-red-500 font-medium";
    if (days <= 21) return "text-amber-600";
    return "text-slate-500";
  };

  const COL = "36px 1fr 148px 128px 132px 56px";

  if (error) {
    const msg = (error as any)?.message || String(error);
    return (
      <div className="py-12 bg-white border border-slate-200 rounded-lg px-8">
        <ClipboardList className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium text-center">Tasks failed to load</p>
        <pre className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded p-3 overflow-x-auto whitespace-pre-wrap">{msg}</pre>
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
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
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
            onClick={() => { setViewStatus("all"); setAssigneeFilter("all"); setAreaFilter("all"); }}
            className="text-sm text-slate-400 hover:text-slate-600 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Monday-style table */}
      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Loading tasks…</div>
      ) : (
        <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
          {/* Column header */}
          <div
            className="grid border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400 select-none"
            style={{ gridTemplateColumns: COL }}
          >
            <div className="h-9" />
            <div className="h-9 flex items-center px-3 border-l border-slate-200">Task</div>
            <div className="h-9 flex items-center px-3 border-l border-slate-200">Assignee</div>
            <div className="h-9 flex items-center px-3 border-l border-slate-200">Due Date</div>
            <div className="h-9 flex items-center px-3 border-l border-slate-200">Status</div>
            <div className="h-9 border-l border-slate-200" />
          </div>

          {visibleSections.map((section) => {
            const items = grouped[section.key];
            return (
              <div key={section.key}>
                {/* Group header */}
                <div className={`flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-100 border-l-4 ${section.accent}`}>
                  <span className={`text-sm font-bold ${section.textColor}`}>{section.label}</span>
                  <span className="text-xs text-slate-400 font-normal">({items.length})</span>
                </div>

                {/* Rows */}
                {items.map((t) => (
                  <div
                    key={t.id}
                    className="grid items-center border-b border-slate-100 group hover:bg-slate-50 min-h-[44px]"
                    style={{ gridTemplateColumns: COL }}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={t.status === "completed"}
                        onChange={() =>
                          updateStatus.mutate({ id: t.id, status: t.status === "completed" ? "todo" : "completed" })
                        }
                        className="w-3.5 h-3.5 rounded cursor-pointer accent-emerald-500"
                      />
                    </div>

                    <div className="px-3 py-2 border-l border-slate-100 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-sm font-medium ${t.status === "completed" ? "line-through text-slate-400" : "text-slate-900"}`}>
                          {t.title}
                        </span>
                        <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded ${PRIORITY_STYLES[t.priority]}`}>
                          {t.priority}
                        </span>
                        {t.area && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t.area}</span>
                        )}
                        {t.link && (
                          <a href={t.link} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-lg">{t.description}</p>
                      )}
                    </div>

                    <div className="px-2 border-l border-slate-100">
                      <select
                        value={t.assignee || ""}
                        onChange={(e) => updateField.mutate({ id: t.id, field: "assignee", value: e.target.value || null })}
                        className="w-full text-xs text-slate-700 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-sm cursor-pointer py-1"
                      >
                        <option value="">Unassigned</option>
                        {[...new Set([t.assignee, ...(assigneeOptions || [])].filter(Boolean) as string[])].sort().map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="px-2 border-l border-slate-100">
                      <input
                        type="date"
                        value={t.due_date || ""}
                        onChange={(e) => updateField.mutate({ id: t.id, field: "due_date", value: e.target.value || null })}
                        className={`w-full text-xs bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-sm cursor-pointer py-1 ${dueColorClass(t)}`}
                      />
                    </div>

                    <div className="px-2 border-l border-slate-100">
                      <div className="relative">
                        <div className={`${STATUS_STYLES[t.status].bg} ${STATUS_STYLES[t.status].text} rounded text-[11px] font-bold px-2 py-1 text-center leading-tight pointer-events-none select-none`}>
                          {STATUS_STYLES[t.status].label}
                        </div>
                        <select
                          value={t.status}
                          onChange={(e) => updateStatus.mutate({ id: t.id, status: e.target.value as AdminTask["status"] })}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-l border-slate-100 flex items-center gap-0.5 justify-center px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-1 text-slate-400 hover:text-amber-600 rounded" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteTask.mutate(t.id)} className="p-1 text-slate-300 hover:text-red-500 rounded" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* + Add item */}
                <div
                  onClick={openNew}
                  className="grid border-b border-slate-100 hover:bg-slate-50 cursor-pointer group/add"
                  style={{ gridTemplateColumns: COL }}
                >
                  <div />
                  <div className="px-3 py-2 flex items-center gap-1.5 text-slate-400 group-hover/add:text-slate-600 text-sm border-l border-slate-100">
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) { setEditingTask(null); setDraft(emptyDraft); }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="What needs to be done?" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Add more details..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as AdminTask["status"] })}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as AdminTask["priority"] })}>
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
                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={draft.assignee} onChange={(e) => setDraft({ ...draft, assignee: e.target.value })}>
                  <option value="">Unassigned</option>
                  {[...new Set([draft.assignee, ...(assigneeOptions || [])].filter(Boolean))].sort().map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={draft.due_date} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Area</Label>
                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value })}>
                  <option value="">None</option>
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Link (optional)</Label>
                <Input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveTask.mutate()} disabled={!draft.title.trim() || saveTask.isPending}>
                {saveTask.isPending ? "Saving..." : editingTask ? "Save Changes" : "Create Task"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

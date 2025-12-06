import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileSpreadsheet, Search, Mail, Edit, Download } from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  email: string;
  podcast_name: string | null;
  rss_url: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "uncontacted", label: "Uncontacted" },
  { value: "contacted", label: "Contacted" },
  { value: "responded", label: "Responded" },
  { value: "registered", label: "Registered" },
  { value: "declined", label: "Declined" },
];

export const ContactManager = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    podcast_name: "",
    rss_url: "",
    notes: "",
    status: "uncontacted",
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["podcast-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcast_contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Contact[];
    },
  });

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter((contact) => {
      const matchesSearch =
        !searchQuery.trim() ||
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.podcast_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchQuery, statusFilter]);

  const addContact = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("podcast_contacts").insert({
        name: data.name,
        email: data.email,
        podcast_name: data.podcast_name || null,
        rss_url: data.rss_url || null,
        notes: data.notes || null,
        status: data.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-contacts"] });
      toast.success("Contact added");
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("A contact with this email already exists");
      } else {
        toast.error(error.message);
      }
    },
  });

  const updateContact = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("podcast_contacts")
        .update({
          name: data.name,
          email: data.email,
          podcast_name: data.podcast_name || null,
          rss_url: data.rss_url || null,
          notes: data.notes || null,
          status: data.status,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-contacts"] });
      toast.success("Contact updated");
      setIsEditDialogOpen(false);
      setEditingContact(null);
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("podcast_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-contacts"] });
      toast.success("Contact deleted");
    },
  });

  const bulkImport = useMutation({
    mutationFn: async (contacts: Array<{ name: string; email: string; podcast_name?: string; rss_url?: string }>) => {
      const { error } = await supabase.from("podcast_contacts").upsert(
        contacts.map((c) => ({
          name: c.name,
          email: c.email,
          podcast_name: c.podcast_name || null,
          rss_url: c.rss_url || null,
          status: "uncontacted",
        })),
        { onConflict: "email", ignoreDuplicates: true }
      );
      if (error) throw error;
      return contacts.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-contacts"] });
      toast.success(`Imported ${count} contacts`);
    },
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", podcast_name: "", rss_url: "", notes: "", status: "uncontacted" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const contacts: Array<{ name: string; email: string; podcast_name?: string; rss_url?: string }> = [];

      // Skip header if present
      const startIndex = lines[0]?.toLowerCase().includes("email") ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const cells = lines[i].split(/[,;\t]/).map((c) => c.trim().replace(/^["']|["']$/g, ""));
        // Try to find email column
        const emailIndex = cells.findIndex((c) => c.includes("@"));
        if (emailIndex === -1) continue;

        const email = cells[emailIndex];
        const name = cells[0] !== email ? cells[0] : cells[1] || email.split("@")[0];
        const podcast_name = cells.find((c, i) => i !== emailIndex && i !== 0 && !c.includes("http"));
        const rss_url = cells.find((c) => c.includes("http"));

        contacts.push({ name, email, podcast_name, rss_url });
      }

      if (contacts.length > 0) {
        bulkImport.mutate(contacts);
      } else {
        toast.error("No valid contacts found in file");
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExport = () => {
    if (!contacts?.length) return;
    const csv = [
      "Name,Email,Podcast,RSS URL,Status,Notes",
      ...contacts.map((c) =>
        [c.name, c.email, c.podcast_name || "", c.rss_url || "", c.status, c.notes || ""]
          .map((v) => `"${v.replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `podcast-contacts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      podcast_name: contact.podcast_name || "",
      rss_url: contact.rss_url || "",
      notes: contact.notes || "",
      status: contact.status,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uncontacted":
        return "bg-secondary text-secondary-foreground";
      case "contacted":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300";
      case "responded":
        return "bg-green-500/20 text-green-700 dark:text-green-300";
      case "registered":
        return "bg-primary/20 text-primary";
      case "declined":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="mt-12">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-xl font-bold text-foreground">Podcast Contacts</h2>
            <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {contacts?.length || 0} total
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.txt,.tsv"
              className="hidden"
            />
            <Button variant="outline" onClick={handleExport} disabled={!contacts?.length}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or podcast..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/30"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(searchQuery || statusFilter !== "all") && (
            <span className="text-sm text-muted-foreground">
              Showing {filteredContacts.length} of {contacts?.length || 0}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading contacts...</div>
      ) : !contacts?.length ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No contacts yet</p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Import from Spreadsheet
          </Button>
        </div>
      ) : (
        <div className="grid gap-2">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{contact.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(contact.status)}`}>
                    {STATUS_OPTIONS.find((o) => o.value === contact.status)?.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                {contact.podcast_name && (
                  <p className="text-xs text-primary truncate">{contact.podcast_name}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => openEditDialog(contact)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {contact.name}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteContact.mutate(contact.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); setEditingContact(null); }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Podcast Name</Label>
                <Input
                  value={formData.podcast_name}
                  onChange={(e) => setFormData({ ...formData, podcast_name: e.target.value })}
                  placeholder="My Podcast"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>RSS URL</Label>
              <Input
                value={formData.rss_url}
                onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any notes about this contact..."
                rows={3}
              />
            </div>
            <Button
              onClick={() => {
                if (!formData.name || !formData.email) {
                  toast.error("Name and email are required");
                  return;
                }
                if (editingContact) {
                  updateContact.mutate({ id: editingContact.id, data: formData });
                } else {
                  addContact.mutate(formData);
                }
              }}
              disabled={addContact.isPending || updateContact.isPending}
              className="w-full"
            >
              {editingContact ? "Update Contact" : "Add Contact"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileSpreadsheet, Search, Mail, Edit, Download, CheckCircle2, XCircle } from "lucide-react";
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
  contact_type: string | null;
  podcast_url: string | null;
  host_name: string | null;
  is_on_vpn: boolean;
  linked_podcast_id: string | null;
}

interface Podcast {
  id: string;
  title: string;
  rss_url: string;
}

const STATUS_OPTIONS = [
  { value: "uncontacted", label: "Uncontacted" },
  { value: "contacted", label: "Contacted" },
  { value: "responded", label: "Responded" },
  { value: "registered", label: "Registered" },
  { value: "declined", label: "Declined" },
];

const TYPE_OPTIONS = [
  "Military Podcast",
  "Veteran Podcast",
  "First Responder Podcast",
  "Other",
];

export const ContactManager = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vpnFilter, setVpnFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    podcast_name: "",
    rss_url: "",
    podcast_url: "",
    host_name: "",
    contact_type: "Military Podcast",
    notes: "",
    status: "uncontacted",
    is_on_vpn: false,
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

  // Fetch all podcasts to match against
  const { data: podcasts } = useQuery({
    queryKey: ["all-podcasts-for-matching"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("id, title, rss_url");
      if (error) throw error;
      return data as Podcast[];
    },
  });

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter((contact) => {
      const matchesSearch =
        !searchQuery.trim() ||
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.podcast_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.host_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
      const matchesVpn = vpnFilter === "all" || 
        (vpnFilter === "on_vpn" && contact.is_on_vpn) ||
        (vpnFilter === "not_on_vpn" && !contact.is_on_vpn);
      return matchesSearch && matchesStatus && matchesVpn;
    });
  }, [contacts, searchQuery, statusFilter, vpnFilter]);

  // Find matching podcast by RSS URL
  const findMatchingPodcast = (rssUrl: string | null | undefined): Podcast | undefined => {
    if (!rssUrl || !podcasts) return undefined;
    const normalizedUrl = rssUrl.toLowerCase().trim();
    return podcasts.find(p => p.rss_url.toLowerCase().trim() === normalizedUrl);
  };

  const addContact = useMutation({
    mutationFn: async (data: typeof formData) => {
      const matchingPodcast = findMatchingPodcast(data.rss_url);
      const { error } = await supabase.from("podcast_contacts").insert({
        name: data.name || data.host_name,
        email: data.email,
        podcast_name: data.podcast_name || null,
        rss_url: data.rss_url || null,
        podcast_url: data.podcast_url || null,
        host_name: data.host_name || null,
        contact_type: data.contact_type || "Military Podcast",
        notes: data.notes || null,
        status: data.status,
        is_on_vpn: matchingPodcast ? true : data.is_on_vpn,
        linked_podcast_id: matchingPodcast?.id || null,
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
      const matchingPodcast = findMatchingPodcast(data.rss_url);
      const { error } = await supabase
        .from("podcast_contacts")
        .update({
          name: data.name || data.host_name,
          email: data.email,
          podcast_name: data.podcast_name || null,
          rss_url: data.rss_url || null,
          podcast_url: data.podcast_url || null,
          host_name: data.host_name || null,
          contact_type: data.contact_type || "Military Podcast",
          notes: data.notes || null,
          status: data.status,
          is_on_vpn: matchingPodcast ? true : data.is_on_vpn,
          linked_podcast_id: matchingPodcast?.id || null,
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
    mutationFn: async (importContacts: Array<{
      name: string;
      email: string;
      podcast_name?: string;
      rss_url?: string;
      podcast_url?: string;
      host_name?: string;
      contact_type?: string;
    }>) => {
      let matchedCount = 0;
      const contactsToInsert = importContacts.map((c) => {
        const matchingPodcast = findMatchingPodcast(c.rss_url);
        if (matchingPodcast) matchedCount++;
        return {
          name: c.name || c.host_name || c.email.split("@")[0],
          email: c.email,
          podcast_name: c.podcast_name || null,
          rss_url: c.rss_url || null,
          podcast_url: c.podcast_url || null,
          host_name: c.host_name || null,
          contact_type: c.contact_type || "Military Podcast",
          status: "uncontacted",
          is_on_vpn: !!matchingPodcast,
          linked_podcast_id: matchingPodcast?.id || null,
        };
      });

      const { error } = await supabase.from("podcast_contacts").upsert(
        contactsToInsert,
        { onConflict: "email", ignoreDuplicates: true }
      );
      if (error) throw error;
      return { total: importContacts.length, matched: matchedCount };
    },
    onSuccess: ({ total, matched }) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-contacts"] });
      toast.success(`Imported ${total} contacts. ${matched} matched to VPN podcasts.`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      podcast_name: "",
      rss_url: "",
      podcast_url: "",
      host_name: "",
      contact_type: "Military Podcast",
      notes: "",
      status: "uncontacted",
      is_on_vpn: false,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const importContacts: Array<{
        name: string;
        email: string;
        podcast_name?: string;
        rss_url?: string;
        podcast_url?: string;
        host_name?: string;
        contact_type?: string;
      }> = [];

      // Parse header to find column indices
      const headerLine = lines[0]?.toLowerCase() || "";
      const headerCells = headerLine.split(/[,;\t]/).map((c) => c.trim().replace(/^["']|["']$/g, ""));
      
      const typeIdx = headerCells.findIndex((c) => c.includes("type"));
      const podcastUrlIdx = headerCells.findIndex((c) => c.includes("podcast url") || c === "podcast_url");
      const rssUrlIdx = headerCells.findIndex((c) => c.includes("rss"));
      const podcastNameIdx = headerCells.findIndex((c) => c.includes("podcast name") || c === "podcast_name");
      const hostNameIdx = headerCells.findIndex((c) => c.includes("host"));
      const emailIdx = headerCells.findIndex((c) => c.includes("email"));

      // Skip header if present
      const startIndex = emailIdx !== -1 ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const cells = lines[i].split(/[,;\t]/).map((c) => c.trim().replace(/^["']|["']$/g, ""));
        
        // Find email - either by index or by searching for @
        let email = emailIdx !== -1 ? cells[emailIdx] : cells.find((c) => c.includes("@"));
        if (!email || !email.includes("@")) continue;

        const contact_type = typeIdx !== -1 ? cells[typeIdx] : "Military Podcast";
        const podcast_url = podcastUrlIdx !== -1 ? cells[podcastUrlIdx] : undefined;
        const rss_url = rssUrlIdx !== -1 ? cells[rssUrlIdx] : undefined;
        const podcast_name = podcastNameIdx !== -1 ? cells[podcastNameIdx] : undefined;
        const host_name = hostNameIdx !== -1 ? cells[hostNameIdx] : undefined;
        const name = host_name || email.split("@")[0];

        importContacts.push({
          name,
          email,
          podcast_name,
          rss_url,
          podcast_url,
          host_name,
          contact_type,
        });
      }

      if (importContacts.length > 0) {
        bulkImport.mutate(importContacts);
      } else {
        toast.error("No valid contacts found in file. Make sure there's an Email column.");
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExport = () => {
    if (!contacts?.length) return;
    const csv = [
      "Type,Podcast URL,RSS URL,Podcast Name,Host Name,Email,Status,Notes,On VPN",
      ...contacts.map((c) =>
        [
          c.contact_type || "",
          c.podcast_url || "",
          c.rss_url || "",
          c.podcast_name || "",
          c.host_name || c.name,
          c.email,
          c.status,
          c.notes || "",
          c.is_on_vpn ? "Yes" : "No",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
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
      podcast_url: contact.podcast_url || "",
      host_name: contact.host_name || "",
      contact_type: contact.contact_type || "Military Podcast",
      notes: contact.notes || "",
      status: contact.status,
      is_on_vpn: contact.is_on_vpn,
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

  const vpnOnCount = contacts?.filter(c => c.is_on_vpn).length || 0;
  const vpnOffCount = (contacts?.length || 0) - vpnOnCount;

  return (
    <div className="mt-12">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-xl font-bold text-foreground">Podcast Contacts</h2>
            <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {contacts?.length || 0} total
            </span>
            <span className="text-sm text-green-600 bg-green-500/20 px-2 py-1 rounded-full">
              {vpnOnCount} on VPN
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

        <div className="flex items-center gap-3 flex-wrap">
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
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
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
          <Select value={vpnFilter} onValueChange={setVpnFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="VPN Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="on_vpn">On VPN</SelectItem>
              <SelectItem value="not_on_vpn">Not on VPN</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || statusFilter !== "all" || vpnFilter !== "all") && (
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
              <div className="flex-shrink-0" title={contact.is_on_vpn ? "On VPN" : "Not on VPN"}>
                {contact.is_on_vpn ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground truncate">{contact.host_name || contact.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(contact.status)}`}>
                    {STATUS_OPTIONS.find((o) => o.value === contact.status)?.label}
                  </span>
                  {contact.contact_type && contact.contact_type !== "Military Podcast" && (
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {contact.contact_type}
                    </span>
                  )}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Host Name *</Label>
                <Input
                  value={formData.host_name || formData.name}
                  onChange={(e) => setFormData({ ...formData, host_name: e.target.value, name: e.target.value })}
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
                <Label>Type</Label>
                <Select value={formData.contact_type} onValueChange={(v) => setFormData({ ...formData, contact_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Podcast URL (Apple/Spotify)</Label>
              <Input
                value={formData.podcast_url}
                onChange={(e) => setFormData({ ...formData, podcast_url: e.target.value })}
                placeholder="https://podcasts.apple.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>RSS URL</Label>
              <Input
                value={formData.rss_url}
                onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2 pb-2">
                  <Checkbox
                    id="is_on_vpn"
                    checked={formData.is_on_vpn}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_on_vpn: !!checked })}
                  />
                  <Label htmlFor="is_on_vpn" className="cursor-pointer">Listed on VPN</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any notes about this contact..."
                rows={2}
              />
            </div>
            <Button
              onClick={() => {
                if (!formData.email) {
                  toast.error("Email is required");
                  return;
                }
                if (!formData.name && !formData.host_name) {
                  toast.error("Host name is required");
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

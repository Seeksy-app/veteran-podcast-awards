import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, FileSpreadsheet, Search, Mail, Edit, Download, CheckCircle2, XCircle, Send, Tag, X, Sparkles, Filter, Save, BarChart3, Eye, MousePointerClick, Clock } from "lucide-react";
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
  source: string | null;
  tags: string[] | null;
  lists: string[] | null;
}

interface MailingList {
  id: string;
  name: string;
  description: string | null;
}

interface SmartList {
  id: string;
  name: string;
  description: string | null;
  filters: {
    status?: string;
    is_on_vpn?: boolean;
    contact_type?: string;
    tags?: string[];
    lists?: string[];
    source?: string;
  };
}

interface Podcast {
  id: string;
  title: string;
  rss_url: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  target_list: string;
  status: string;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  sent_at: string | null;
  created_at: string;
}

interface EmailSend {
  id: string;
  campaign_id: string | null;
  contact_id: string | null;
  email: string;
  status: string;
  resend_id: string | null;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
}

const STATUS_OPTIONS = [
  { value: "uncontacted", label: "Uncontacted" },
  { value: "contacted", label: "Contacted" },
  { value: "responded", label: "Responded" },
  { value: "registered", label: "Registered" },
  { value: "declined", label: "Declined" },
];

const TYPE_OPTIONS = ["Military Podcast", "Veteran Podcast", "First Responder Podcast", "Other"];

const SOURCE_OPTIONS = ["Manual", "CSV Import", "Website Signup", "Referral", "Event", "Social Media", "Cold Outreach"];

export const ContactManager = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("contacts");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSmartListDialogOpen, setIsSmartListDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vpnFilter, setVpnFilter] = useState<string>("all");
  const [listFilter, setListFilter] = useState<string>("all");
  const [smartListFilter, setSmartListFilter] = useState<string>("all");
  const [newTag, setNewTag] = useState("");
  const [newSmartListTag, setNewSmartListTag] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImportData, setPendingImportData] = useState<Array<{
    name: string;
    email: string;
    podcast_name?: string;
    rss_url?: string;
    podcast_url?: string;
    host_name?: string;
    contact_type?: string;
  }> | null>(null);

  const [importOptions, setImportOptions] = useState({
    source: "CSV Import",
    lists: [] as string[],
    tags: [] as string[],
  });

  const [smartListForm, setSmartListForm] = useState({
    name: "",
    description: "",
    status: "all",
    is_on_vpn: "all",
    contact_type: "all",
    source: "all",
    tags: [] as string[],
  });

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
    source: "Manual",
    tags: [] as string[],
    lists: [] as string[],
  });

  const [campaignData, setCampaignData] = useState({
    name: "",
    subject: "",
    content: "",
    targetList: "",
    fromName: "Veteran Podcast Awards",
    fromEmail: "hello@veteranpodcastawards.com",
  });

  const FROM_EMAIL_OPTIONS = [
    { label: "VPA (hello@veteranpodcastawards.com)", value: "hello@veteranpodcastawards.com" },
    { label: "VPA Notifications (notifications@veteranpodcastawards.com)", value: "notifications@veteranpodcastawards.com" },
    { label: "Seeksy (hello@seeksy.io)", value: "hello@seeksy.io" },
  ];

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

  const { data: mailingLists } = useQuery({
    queryKey: ["mailing-lists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mailing_lists").select("*").order("name");
      if (error) throw error;
      return data as MailingList[];
    },
  });

  const { data: smartLists } = useQuery({
    queryKey: ["smart-lists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("smart_lists").select("*").order("name");
      if (error) throw error;
      return data as SmartList[];
    },
  });

  const { data: podcasts } = useQuery({
    queryKey: ["all-podcasts-for-matching"],
    queryFn: async () => {
      const { data, error } = await supabase.from("podcasts").select("id, title, rss_url");
      if (error) throw error;
      return data as Podcast[];
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["email-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const { data: campaignSends } = useQuery({
    queryKey: ["email-sends", selectedCampaign],
    queryFn: async () => {
      if (!selectedCampaign) return [];
      const { data, error } = await supabase
        .from("email_sends")
        .select("*")
        .eq("campaign_id", selectedCampaign)
        .order("sent_at", { ascending: false });
      if (error) throw error;
      return data as EmailSend[];
    },
    enabled: !!selectedCampaign,
  });

  // Apply smart list filter
  const applySmartListFilter = (contact: Contact, smartList: SmartList): boolean => {
    const filters = smartList.filters;
    if (filters.status && contact.status !== filters.status) return false;
    if (filters.is_on_vpn !== undefined && contact.is_on_vpn !== filters.is_on_vpn) return false;
    if (filters.contact_type && contact.contact_type !== filters.contact_type) return false;
    if (filters.source && contact.source !== filters.source) return false;
    if (filters.tags?.length && !filters.tags.some(t => contact.tags?.includes(t))) return false;
    if (filters.lists?.length && !filters.lists.some(l => contact.lists?.includes(l))) return false;
    return true;
  };

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter((contact) => {
      const matchesSearch =
        !searchQuery.trim() ||
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.podcast_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.host_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
      const matchesVpn = vpnFilter === "all" || (vpnFilter === "on_vpn" && contact.is_on_vpn) || (vpnFilter === "not_on_vpn" && !contact.is_on_vpn);
      const matchesList = listFilter === "all" || contact.lists?.includes(listFilter);
      
      // Smart list filter
      let matchesSmartList = true;
      if (smartListFilter !== "all" && smartLists) {
        const smartList = smartLists.find(sl => sl.id === smartListFilter);
        if (smartList) {
          matchesSmartList = applySmartListFilter(contact, smartList);
        }
      }
      
      return matchesSearch && matchesStatus && matchesVpn && matchesList && matchesSmartList;
    });
  }, [contacts, searchQuery, statusFilter, vpnFilter, listFilter, smartListFilter, smartLists]);

  const findMatchingPodcast = (rssUrl: string | null | undefined): Podcast | undefined => {
    if (!rssUrl || !podcasts) return undefined;
    const normalizedUrl = rssUrl.toLowerCase().trim();
    return podcasts.find((p) => p.rss_url.toLowerCase().trim() === normalizedUrl);
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
        source: data.source || "Manual",
        tags: data.tags,
        lists: data.lists,
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
          source: data.source || "Manual",
          tags: data.tags,
          lists: data.lists,
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
    mutationFn: async ({
      importContacts,
      options,
    }: {
      importContacts: Array<{
        name: string;
        email: string;
        podcast_name?: string;
        rss_url?: string;
        podcast_url?: string;
        host_name?: string;
        contact_type?: string;
      }>;
      options: typeof importOptions;
    }) => {
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
          source: options.source,
          tags: options.tags,
          lists: options.lists,
        };
      });

      const { error } = await supabase.from("podcast_contacts").upsert(contactsToInsert, { onConflict: "email", ignoreDuplicates: true });
      if (error) throw error;
      return { total: importContacts.length, matched: matchedCount };
    },
    onSuccess: ({ total, matched }) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-contacts"] });
      toast.success(`Imported ${total} contacts. ${matched} matched to VPN podcasts.`);
      setIsImportDialogOpen(false);
      setPendingImportData(null);
      setImportOptions({ source: "CSV Import", lists: [], tags: [] });
    },
  });

  const createSmartList = useMutation({
    mutationFn: async (data: typeof smartListForm) => {
      const filters: SmartList["filters"] = {};
      if (data.status !== "all") filters.status = data.status;
      if (data.is_on_vpn !== "all") filters.is_on_vpn = data.is_on_vpn === "true";
      if (data.contact_type !== "all") filters.contact_type = data.contact_type;
      if (data.source !== "all") filters.source = data.source;
      if (data.tags.length > 0) filters.tags = data.tags;

      const { error } = await supabase.from("smart_lists").insert({
        name: data.name,
        description: data.description || null,
        filters,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-lists"] });
      toast.success("Smart list created");
      setIsSmartListDialogOpen(false);
      setSmartListForm({ name: "", description: "", status: "all", is_on_vpn: "all", contact_type: "all", source: "all", tags: [] });
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("A smart list with this name already exists");
      } else {
        toast.error(error.message);
      }
    },
  });

  const deleteSmartList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("smart_lists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-lists"] });
      toast.success("Smart list deleted");
    },
  });

  const sendCampaign = useMutation({
    mutationFn: async (data: typeof campaignData) => {
      // Create campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .insert({
          name: data.name,
          subject: data.subject,
          content: data.content,
          target_list: data.targetList,
          status: "sending",
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Call edge function to send emails
      const { data: result, error: sendError } = await supabase.functions.invoke("send-campaign", {
        body: {
          campaignId: campaign.id,
          subject: data.subject,
          content: data.content,
          targetList: data.targetList,
          fromName: data.fromName,
          fromEmail: data.fromEmail,
        },
      });

      if (sendError) throw sendError;
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Campaign sent! ${result.sent} emails delivered, ${result.failed} failed.`);
      setIsCampaignDialogOpen(false);
      setCampaignData({ name: "", subject: "", content: "", targetList: "", fromName: "Veteran Podcast Awards", fromEmail: "hello@veteranpodcastawards.com" });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send campaign: ${error.message}`);
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
      source: "Manual",
      tags: [],
      lists: [],
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

      const headerLine = lines[0]?.toLowerCase() || "";
      const headerCells = headerLine.split(/[,;\t]/).map((c) => c.trim().replace(/^["']|["']$/g, ""));

      const typeIdx = headerCells.findIndex((c) => c.includes("type"));
      const podcastUrlIdx = headerCells.findIndex((c) => c.includes("podcast url") || c === "podcast_url");
      const rssUrlIdx = headerCells.findIndex((c) => c.includes("rss"));
      const podcastNameIdx = headerCells.findIndex((c) => c.includes("podcast name") || c === "podcast_name");
      const hostNameIdx = headerCells.findIndex((c) => c.includes("host"));
      const emailIdx = headerCells.findIndex((c) => c.includes("email"));

      const startIndex = emailIdx !== -1 ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const cells = lines[i].split(/[,;\t]/).map((c) => c.trim().replace(/^["']|["']$/g, ""));

        let email = emailIdx !== -1 ? cells[emailIdx] : cells.find((c) => c.includes("@"));
        if (!email || !email.includes("@")) continue;

        const contact_type = typeIdx !== -1 ? cells[typeIdx] : "Military Podcast";
        const podcast_url = podcastUrlIdx !== -1 ? cells[podcastUrlIdx] : undefined;
        const rss_url = rssUrlIdx !== -1 ? cells[rssUrlIdx] : undefined;
        const podcast_name = podcastNameIdx !== -1 ? cells[podcastNameIdx] : undefined;
        const host_name = hostNameIdx !== -1 ? cells[hostNameIdx] : undefined;
        const name = host_name || email.split("@")[0];

        importContacts.push({ name, email, podcast_name, rss_url, podcast_url, host_name, contact_type });
      }

      if (importContacts.length > 0) {
        // Open import dialog with parsed data
        setPendingImportData(importContacts);
        setIsImportDialogOpen(true);
        toast.success(`Found ${importContacts.length} contacts. Configure import options.`);
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
      "Type,Podcast URL,RSS URL,Podcast Name,Host Name,Email,Status,Source,Tags,Lists,On VPN,Notes",
      ...contacts.map((c) =>
        [
          c.contact_type || "",
          c.podcast_url || "",
          c.rss_url || "",
          c.podcast_name || "",
          c.host_name || c.name,
          c.email,
          c.status,
          c.source || "",
          (c.tags || []).join(";"),
          (c.lists || []).join(";"),
          c.is_on_vpn ? "Yes" : "No",
          c.notes || "",
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
      source: contact.source || "Manual",
      tags: contact.tags || [],
      lists: contact.lists || [],
    });
    setIsEditDialogOpen(true);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const toggleList = (listName: string) => {
    if (formData.lists.includes(listName)) {
      setFormData({ ...formData, lists: formData.lists.filter((l) => l !== listName) });
    } else {
      setFormData({ ...formData, lists: [...formData.lists, listName] });
    }
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

  const vpnOnCount = contacts?.filter((c) => c.is_on_vpn).length || 0;
  const listCounts = useMemo(() => {
    if (!contacts || !mailingLists) return {};
    return mailingLists.reduce(
      (acc, list) => {
        acc[list.name] = contacts.filter((c) => c.lists?.includes(list.name)).length;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [contacts, mailingLists]);

  const smartListCounts = useMemo(() => {
    if (!contacts || !smartLists) return {};
    return smartLists.reduce(
      (acc, smartList) => {
        acc[smartList.id] = contacts.filter((c) => applySmartListFilter(c, smartList)).length;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [contacts, smartLists]);

  const toggleImportList = (listName: string) => {
    if (importOptions.lists.includes(listName)) {
      setImportOptions({ ...importOptions, lists: importOptions.lists.filter((l) => l !== listName) });
    } else {
      setImportOptions({ ...importOptions, lists: [...importOptions.lists, listName] });
    }
  };

  const addImportTag = (tag: string) => {
    if (tag.trim() && !importOptions.tags.includes(tag.trim())) {
      setImportOptions({ ...importOptions, tags: [...importOptions.tags, tag.trim()] });
    }
  };

  const removeImportTag = (tag: string) => {
    setImportOptions({ ...importOptions, tags: importOptions.tags.filter((t) => t !== tag) });
  };

  const addSmartListTag = () => {
    if (newSmartListTag.trim() && !smartListForm.tags.includes(newSmartListTag.trim())) {
      setSmartListForm({ ...smartListForm, tags: [...smartListForm.tags, newSmartListTag.trim()] });
      setNewSmartListTag("");
    }
  };

  const removeSmartListTag = (tag: string) => {
    setSmartListForm({ ...smartListForm, tags: smartListForm.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="mt-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.txt,.tsv" className="hidden" />
            {activeTab === "contacts" && (
              <>
                <Button variant="outline" onClick={() => setIsCampaignDialogOpen(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Campaign
                </Button>
                <Button variant="outline" onClick={handleExport} disabled={!contacts?.length}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsContent value="contacts" className="mt-0">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">{contacts?.length || 0} total</span>
              <span className="text-sm text-green-600 bg-green-500/20 px-2 py-1 rounded-full">{vpnOnCount} on VPN</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, email, podcast, or tag..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-secondary/30" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
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
              <Select value={listFilter} onValueChange={setListFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="List" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lists</SelectItem>
                  {mailingLists?.map((list) => (
                    <SelectItem key={list.id} value={list.name}>
                      {list.name} ({listCounts[list.name] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={vpnFilter} onValueChange={setVpnFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="VPN" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="on_vpn">On VPN</SelectItem>
                  <SelectItem value="not_on_vpn">Not on VPN</SelectItem>
                </SelectContent>
              </Select>
              <Select value={smartListFilter} onValueChange={setSmartListFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Smart List" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Smart Lists</SelectItem>
                  {smartLists?.map((sl) => (
                    <SelectItem key={sl.id} value={sl.id}>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {sl.name} ({smartListCounts[sl.id] || 0})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchQuery || statusFilter !== "all" || vpnFilter !== "all" || listFilter !== "all" || smartListFilter !== "all") && (
                <span className="text-sm text-muted-foreground">
                  {filteredContacts.length} of {contacts?.length || 0}
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
                    {contact.is_on_vpn ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground truncate">{contact.host_name || contact.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(contact.status)}`}>{STATUS_OPTIONS.find((o) => o.value === contact.status)?.label}</span>
                      {contact.lists?.map((list) => (
                        <Badge key={list} variant="outline" className="text-xs">
                          {list}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {contact.podcast_name && <span className="text-xs text-primary truncate">{contact.podcast_name}</span>}
                      {contact.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
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
                          <AlertDialogDescription>Are you sure you want to delete {contact.name}?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteContact.mutate(contact.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
        </TabsContent>

        <TabsContent value="lists" className="mt-0">
          <div className="space-y-6">
            {/* Regular Mailing Lists */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Mailing Lists</h3>
              <div className="grid gap-2">
                {mailingLists?.map((list) => (
                  <div key={list.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium text-foreground">{list.name}</h4>
                      {list.description && <p className="text-xs text-muted-foreground">{list.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{listCounts[list.name] || 0} contacts</span>
                      <Button variant="outline" size="sm" onClick={() => { setCampaignData({ ...campaignData, targetList: list.name }); setIsCampaignDialogOpen(true); }}>
                        <Send className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Lists */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Smart Lists
                </h3>
                <Button size="sm" onClick={() => setIsSmartListDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Smart List
                </Button>
              </div>
              <div className="grid gap-2">
                {smartLists?.map((smartList) => (
                  <div key={smartList.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-primary" />
                        {smartList.name}
                      </h4>
                      {smartList.description && <p className="text-xs text-muted-foreground">{smartList.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {smartList.filters.status && (
                          <Badge variant="secondary" className="text-xs">Status: {smartList.filters.status}</Badge>
                        )}
                        {smartList.filters.is_on_vpn !== undefined && (
                          <Badge variant="secondary" className="text-xs">VPN: {smartList.filters.is_on_vpn ? "Yes" : "No"}</Badge>
                        )}
                        {smartList.filters.contact_type && (
                          <Badge variant="secondary" className="text-xs">{smartList.filters.contact_type}</Badge>
                        )}
                        {smartList.filters.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">Tag: {tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{smartListCounts[smartList.id] || 0} contacts</span>
                      <Button variant="outline" size="sm" onClick={() => { setSmartListFilter(smartList.id); setActiveTab("contacts"); }}>
                        <Filter className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-destructive h-8 w-8">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Smart List</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete "{smartList.name}"?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteSmartList.mutate(smartList.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                {!smartLists?.length && (
                  <p className="text-sm text-muted-foreground text-center py-4">No smart lists yet. Create one to filter contacts dynamically.</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Campaign History</h3>
              <span className="text-sm text-muted-foreground">({campaigns?.length || 0} campaigns)</span>
            </div>

            {!campaigns?.length ? (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No campaigns sent yet</p>
                <p className="text-sm text-muted-foreground">Send your first email campaign from the Contacts tab</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`p-4 bg-card border rounded-lg cursor-pointer transition-colors ${
                      selectedCampaign === campaign.id ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedCampaign(selectedCampaign === campaign.id ? null : campaign.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                      </div>
                      <Badge variant={campaign.status === "sent" ? "default" : campaign.status === "sending" ? "secondary" : "outline"}>
                        {campaign.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Send className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{campaign.sent_count}</span>
                        <span className="text-muted-foreground">sent</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{campaign.opened_count}</span>
                        <span className="text-muted-foreground">opened</span>
                        {campaign.sent_count > 0 && (
                          <span className="text-muted-foreground">
                            ({Math.round((campaign.opened_count / campaign.sent_count) * 100)}%)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MousePointerClick className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{campaign.clicked_count}</span>
                        <span className="text-muted-foreground">clicked</span>
                        {campaign.sent_count > 0 && (
                          <span className="text-muted-foreground">
                            ({Math.round((campaign.clicked_count / campaign.sent_count) * 100)}%)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {campaign.sent_at
                            ? new Date(campaign.sent_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : "Not sent"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        List: {campaign.target_list}
                      </Badge>
                    </div>

                    {/* Expanded send log */}
                    {selectedCampaign === campaign.id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h5 className="text-sm font-medium text-foreground mb-3">Send Log</h5>
                        {!campaignSends?.length ? (
                          <p className="text-sm text-muted-foreground">No send records found</p>
                        ) : (
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {campaignSends.map((send) => (
                              <div
                                key={send.id}
                                className="flex items-center justify-between p-2 bg-secondary/30 rounded text-sm"
                              >
                                <span className="text-foreground truncate max-w-[200px]">{send.email}</span>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant={send.status === "sent" ? "default" : send.status === "failed" ? "destructive" : "outline"}
                                    className="text-xs"
                                  >
                                    {send.status}
                                  </Badge>
                                  {send.opened_at && (
                                    <span className="flex items-center gap-1 text-blue-500">
                                      <Eye className="w-3 h-3" />
                                      Opened
                                    </span>
                                  )}
                                  {send.clicked_at && (
                                    <span className="flex items-center gap-1 text-green-500">
                                      <MousePointerClick className="w-3 h-3" />
                                      Clicked
                                    </span>
                                  )}
                                  <span className="text-muted-foreground text-xs">
                                    {new Date(send.sent_at).toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Contact Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingContact(null);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Host Name *</Label>
                <Input value={formData.host_name || formData.name} onChange={(e) => setFormData({ ...formData, host_name: e.target.value, name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Podcast Name</Label>
                <Input value={formData.podcast_name} onChange={(e) => setFormData({ ...formData, podcast_name: e.target.value })} placeholder="My Podcast" />
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
              <Label>Podcast URL</Label>
              <Input value={formData.podcast_url} onChange={(e) => setFormData({ ...formData, podcast_url: e.target.value })} placeholder="https://podcasts.apple.com/..." />
            </div>
            <div className="space-y-2">
              <Label>RSS URL</Label>
              <Input value={formData.rss_url} onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })} placeholder="https://..." />
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
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mailing Lists</Label>
              <div className="flex flex-wrap gap-2">
                {mailingLists?.map((list) => (
                  <Badge
                    key={list.id}
                    variant={formData.lists.includes(list.name) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleList(list.name)}
                  >
                    {list.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="is_on_vpn" checked={formData.is_on_vpn} onCheckedChange={(checked) => setFormData({ ...formData, is_on_vpn: !!checked })} />
              <Label htmlFor="is_on_vpn" className="cursor-pointer">
                Listed on VPN
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any notes..." rows={2} />
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

      {/* Send Campaign Dialog */}
      <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Email Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input value={campaignData.name} onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })} placeholder="December Newsletter" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target List *</Label>
                <Select value={campaignData.targetList} onValueChange={(v) => setCampaignData({ ...campaignData, targetList: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a list..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mailingLists?.map((list) => (
                      <SelectItem key={list.id} value={list.name}>
                        {list.name} ({listCounts[list.name] || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>From Email *</Label>
                <Select value={campaignData.fromEmail} onValueChange={(v) => setCampaignData({ ...campaignData, fromEmail: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FROM_EMAIL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input value={campaignData.fromName} onChange={(e) => setCampaignData({ ...campaignData, fromName: e.target.value })} placeholder="Veteran Podcast Awards" />
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input value={campaignData.subject} onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })} placeholder="Hello {{name}}!" />
              <p className="text-xs text-muted-foreground">Use {"{{name}}"} for personalization</p>
            </div>
            <div className="space-y-2">
              <Label>Email Content (HTML) *</Label>
              <Textarea
                value={campaignData.content}
                onChange={(e) => setCampaignData({ ...campaignData, content: e.target.value })}
                placeholder="<h1>Hello {{name}}!</h1><p>Thank you for being part of our network...</p>"
                rows={8}
              />
              <p className="text-xs text-muted-foreground">Use {"{{name}}"}, {"{{podcast_name}}"}, {"{{email}}"} for personalization</p>
            </div>
            <Button
              onClick={() => {
                if (!campaignData.targetList || !campaignData.subject || !campaignData.content) {
                  toast.error("Please fill in all required fields");
                  return;
                }
                sendCampaign.mutate(campaignData);
              }}
              disabled={sendCampaign.isPending}
              className="w-full"
            >
              {sendCampaign.isPending ? "Sending..." : `Send to ${listCounts[campaignData.targetList] || 0} contacts`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Options Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={(open) => { if (!open) { setIsImportDialogOpen(false); setPendingImportData(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import {pendingImportData?.length || 0} Contacts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={importOptions.source} onValueChange={(v) => setImportOptions({ ...importOptions, source: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Add to Lists</Label>
              <div className="flex flex-wrap gap-2">
                {mailingLists?.map((list) => (
                  <Badge
                    key={list.id}
                    variant={importOptions.lists.includes(list.name) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleImportList(list.name)}
                  >
                    {list.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImportTag((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
              </div>
              {importOptions.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {importOptions.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeImportTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                if (pendingImportData) {
                  bulkImport.mutate({ importContacts: pendingImportData, options: importOptions });
                }
              }}
              disabled={bulkImport.isPending}
              className="w-full"
            >
              {bulkImport.isPending ? "Importing..." : `Import ${pendingImportData?.length || 0} Contacts`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Smart List Dialog */}
      <Dialog open={isSmartListDialogOpen} onOpenChange={setIsSmartListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Create Smart List
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={smartListForm.name} onChange={(e) => setSmartListForm({ ...smartListForm, name: e.target.value })} placeholder="My Smart List" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={smartListForm.description} onChange={(e) => setSmartListForm({ ...smartListForm, description: e.target.value })} placeholder="Optional description..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={smartListForm.status} onValueChange={(v) => setSmartListForm({ ...smartListForm, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>On VPN</Label>
                <Select value={smartListForm.is_on_vpn} onValueChange={(v) => setSmartListForm({ ...smartListForm, is_on_vpn: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={smartListForm.contact_type} onValueChange={(v) => setSmartListForm({ ...smartListForm, contact_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={smartListForm.source} onValueChange={(v) => setSmartListForm({ ...smartListForm, source: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Must have tags</Label>
              <div className="flex gap-2">
                <Input value={newSmartListTag} onChange={(e) => setNewSmartListTag(e.target.value)} placeholder="Add tag filter..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSmartListTag())} />
                <Button type="button" variant="outline" onClick={addSmartListTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {smartListForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {smartListForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeSmartListTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                if (!smartListForm.name) {
                  toast.error("Name is required");
                  return;
                }
                createSmartList.mutate(smartListForm);
              }}
              disabled={createSmartList.isPending}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Create Smart List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

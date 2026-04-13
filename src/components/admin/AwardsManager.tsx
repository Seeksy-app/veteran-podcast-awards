import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, MoreHorizontal, Pencil, Plus, Sparkles, Trash2, Vote } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AwardTicketsAdmin } from "@/components/admin/AwardTicketsAdmin";

type AwardProgram = Database["public"]["Tables"]["award_programs"]["Row"];
type AwardCategory = Database["public"]["Tables"]["award_categories"]["Row"];
type ProgramStatus = Database["public"]["Enums"]["award_program_status"];

const GOLD = "#B8860B";
const GOLD_RING = "border-l-[3px] border-[#B8860B]";

/** Matches seeded VPA 2026 migration (slugs must stay unique per program) */
const SEEDED_CATEGORY_PRESETS: { slug: string; name: string; description: string }[] = [
  { slug: "best-interview-show", name: "Best Interview Show", description: "Excellence in long-form or episodic interview content." },
  { slug: "best-solo-show", name: "Best Solo Show", description: "Outstanding single-host or solo narrative podcast." },
  { slug: "best-comedy", name: "Best Comedy", description: "Humor, satire, and entertainment." },
  { slug: "best-educational", name: "Best Educational", description: "Teaching, skills, and informative programming." },
  { slug: "best-newcomer", name: "Best Newcomer", description: "Breakthrough podcast in its first qualifying period." },
  { slug: "best-veteran-storyteller", name: "Best Veteran Storyteller", description: "Personal stories and narrative from those who served." },
  { slug: "best-military-family-show", name: "Best Military Family Show", description: "Content centered on military and veteran families." },
  { slug: "best-true-crime", name: "Best True Crime", description: "Investigative and narrative true crime." },
  { slug: "podcaster-of-the-year", name: "Podcaster of the Year", description: "Overall excellence in hosting and production." },
  { slug: "lifetime-achievement", name: "Lifetime Achievement", description: "Sustained impact and contribution to the community." },
  { slug: "best-overall-veteran-podcast", name: "Best Overall Veteran Podcast", description: "Top veteran-focused podcast across all formats and branches." },
  { slug: "best-army-veteran-podcast", name: "Best Army Veteran Podcast", description: "Excellence in Army veteran stories, culture, and community." },
  { slug: "best-navy-veteran-podcast", name: "Best Navy Veteran Podcast", description: "Outstanding Navy veteran voices and maritime military themes." },
  { slug: "best-marine-corps-veteran-podcast", name: "Best Marine Corps Veteran Podcast", description: "Marine Corps veteran perspective, history, and storytelling." },
  { slug: "best-air-force-veteran-podcast", name: "Best Air Force Veteran Podcast", description: "Air Force veteran content, aviation, and service life." },
  { slug: "best-military-transition-podcast", name: "Best Military Transition Podcast", description: "Resources and stories for the transition from service to civilian life." },
];

function categoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    "best-interview-show": "🎤",
    "best-solo-show": "🎧",
    "best-comedy": "🎭",
    "best-educational": "📚",
    "best-newcomer": "🌟",
    "best-veteran-storyteller": "🎖️",
    "best-military-family-show": "👨‍👩‍👧",
    "best-true-crime": "🔍",
    "podcaster-of-the-year": "🏆",
    "lifetime-achievement": "💎",
    "best-overall-veteran-podcast": "🎖️",
    "best-army-veteran-podcast": "⭐",
    "best-navy-veteran-podcast": "⚓",
    "best-marine-corps-veteran-podcast": "🦅",
    "best-air-force-veteran-podcast": "✈️",
    "best-military-transition-podcast": "🌉",
  };
  return map[slug] ?? "✨";
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "category"
  );
}

function csvEscape(s: string) {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "MMM d, yyyy h:mm a");
  } catch {
    return iso;
  }
}

function formatDateOnly(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    const dt = d.length <= 10 ? new Date(`${d}T12:00:00`) : new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return format(dt, "MMM d, yyyy");
  } catch {
    return "—";
  }
}

/** Compact date for sidebar summary (e.g. Jun 1) */
function formatShortDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    const dt = d.length <= 10 ? new Date(`${d}T12:00:00`) : new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return format(dt, "MMM d");
  } catch {
    return "—";
  }
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  if (iso.length >= 10 && iso[4] === "-" && iso[7] === "-") return iso.slice(0, 10);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function normalizeAwardProgramRow(raw: Record<string, unknown>): AwardProgram {
  const n =
    (raw.nominations_open_at as string | null | undefined) ??
    (raw.nominations_open_date as string | null | undefined);
  const v =
    (raw.voting_open_at as string | null | undefined) ?? (raw.voting_open_date as string | null | undefined);
  const c = (raw.ceremony_at as string | null | undefined) ?? (raw.ceremony_date as string | null | undefined);
  return {
    ...(raw as unknown as AwardProgram),
    nominations_open_at: n ?? null,
    voting_open_at: v ?? null,
    ceremony_at: c ?? null,
  };
}

function statusPill(status: ProgramStatus) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:text-emerald-400">
          Active
        </span>
      );
    case "closed":
      return (
        <span className="inline-flex items-center rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/25 dark:text-red-400">
          Closed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
          Draft
        </span>
      );
  }
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-b border-border/60 pb-3", GOLD_RING, "pl-4")}>
      <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
      {action}
    </div>
  );
}

export const AwardsManager = () => {
  const queryClient = useQueryClient();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [leaderboardProgramId, setLeaderboardProgramId] = useState<string | null>(null);
  const [leaderboardCategoryId, setLeaderboardCategoryId] = useState<string | null>(null);

  const [programEditing, setProgramEditing] = useState(false);
  const [programDraft, setProgramDraft] = useState<{
    name: string;
    year: number;
    status: ProgramStatus;
    nominations_open_at: string;
    voting_open_at: string;
    ceremony_at: string;
    primary_color: string;
    logo_url: string;
    tagline: string;
    website_url: string;
    organization_name: string;
  } | null>(null);

  const [newProgram, setNewProgram] = useState({
    name: "",
    year: new Date().getFullYear(),
    status: "draft" as ProgramStatus,
    nominations_open_at: "",
    voting_open_at: "",
    ceremony_at: "",
    primary_color: "#B8860B",
    logo_url: "",
    tagline: "",
    website_url: "",
    organization_name: "",
    external_ticket_url: "",
  });

  const [presetChipSlugs, setPresetChipSlugs] = useState<Set<string>>(new Set());
  const [customCategoryName, setCustomCategoryName] = useState("");

  const [editCategoryTarget, setEditCategoryTarget] = useState<AwardCategory | null>(null);
  const [editCategoryDraft, setEditCategoryDraft] = useState({ name: "", description: "" });
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<AwardCategory | null>(null);

  const { data: programs = [], isLoading: loadingPrograms } = useQuery({
    queryKey: ["award-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("award_programs")
        .select("*")
        .order("year", { ascending: false })
        .order("name");
      if (error) throw error;
      return (data ?? []).map((row) => normalizeAwardProgramRow(row as Record<string, unknown>));
    },
  });

  const resolvedProgramId = useMemo(() => {
    if (selectedProgramId && programs.some((p) => p.id === selectedProgramId)) {
      return selectedProgramId;
    }
    const active = programs.find((p) => p.status === "active");
    return active?.id ?? programs[0]?.id ?? null;
  }, [programs, selectedProgramId]);

  const selectedProgram = useMemo(
    () => (resolvedProgramId ? programs.find((p) => p.id === resolvedProgramId) ?? null : null),
    [programs, resolvedProgramId],
  );

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["award-categories", resolvedProgramId],
    queryFn: async () => {
      if (!resolvedProgramId) return [];
      const { data, error } = await supabase
        .from("award_categories")
        .select("*")
        .eq("program_id", resolvedProgramId)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data as AwardCategory[];
    },
    enabled: Boolean(resolvedProgramId && programs.length > 0),
  });

  const categorySlugs = useMemo(() => categories.map((c) => c.slug), [categories]);
  const categoryIds = useMemo(() => categories.map((c) => c.id), [categories]);
  const programYear = selectedProgram?.year;

  const { data: voteAgg } = useQuery({
    queryKey: [
      "award-vote-agg",
      resolvedProgramId,
      programYear,
      categorySlugs.join("|"),
      categoryIds.join("|"),
    ],
    queryFn: async () => {
      if (!programYear || !resolvedProgramId || categorySlugs.length === 0)
        return { votes: {}, nominations: {} };
      const [vc, nom] = await Promise.all([
        supabase
          .from("vote_counts")
          .select("category_id, vote_count")
          .eq("year", programYear)
          .eq("program_id", resolvedProgramId)
          .in("category_id", categorySlugs),
        supabase.from("nominations").select("category_id").in("category_id", categoryIds),
      ]);
      if (vc.error) throw vc.error;
      if (nom.error) throw nom.error;

      const votes: Record<string, number> = {};
      for (const row of vc.data ?? []) {
        votes[row.category_id] = (votes[row.category_id] ?? 0) + row.vote_count;
      }
      const nominations: Record<string, number> = {};
      for (const row of nom.data ?? []) {
        nominations[row.category_id] = (nominations[row.category_id] ?? 0) + 1;
      }
      return { votes, nominations };
    },
    enabled: !!programYear && !!resolvedProgramId && categories.length > 0,
  });

  const { data: sidebarStats } = useQuery({
    queryKey: ["award-program-sidebar-stats", programs.map((p) => p.id).join("|")],
    queryFn: async () => {
      const out: Record<string, { categories: number; nominees: number; votes: number }> = {};
      for (const p of programs) {
        const { data: cats } = await supabase.from("award_categories").select("id").eq("program_id", p.id);
        const ids = (cats ?? []).map((c) => c.id);
        let nominees = 0;
        if (ids.length) {
          const { count } = await supabase
            .from("nominations")
            .select("id", { count: "exact", head: true })
            .in("category_id", ids);
          nominees = count ?? 0;
        }
        const { data: vc } = await supabase.from("vote_counts").select("vote_count").eq("program_id", p.id);
        const votes = (vc ?? []).reduce((s, r) => s + r.vote_count, 0);
        out[p.id] = { categories: ids.length, nominees, votes };
      }
      return out;
    },
    enabled: programs.length > 0,
  });

  const totalVotesProgram = useMemo(() => {
    if (!voteAgg?.votes) return 0;
    return Object.values(voteAgg.votes).reduce((a, b) => a + b, 0);
  }, [voteAgg]);

  const totalNomineesProgram = useMemo(() => {
    if (!voteAgg?.nominations) return 0;
    return Object.values(voteAgg.nominations).reduce((a, b) => a + b, 0);
  }, [voteAgg]);

  const createProgram = useMutation({
    mutationFn: async () => {
      const row: Database["public"]["Tables"]["award_programs"]["Insert"] = {
        name: newProgram.name.trim(),
        year: newProgram.year,
        status: newProgram.status,
        nominations_open_at: newProgram.nominations_open_at
          ? new Date(newProgram.nominations_open_at).toISOString()
          : null,
        voting_open_at: newProgram.voting_open_at ? new Date(newProgram.voting_open_at).toISOString() : null,
        ceremony_at: newProgram.ceremony_at || null,
        primary_color: newProgram.primary_color.trim() || "#B8860B",
        logo_url: newProgram.logo_url.trim() || null,
        tagline: newProgram.tagline.trim() || null,
        website_url: newProgram.website_url.trim() || null,
        organization_name: newProgram.organization_name.trim() || null,
        external_ticket_url: newProgram.external_ticket_url.trim() || null,
      };
      const { error } = await supabase.from("award_programs").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["award-programs"] });
      queryClient.invalidateQueries({ queryKey: ["award-program-sidebar-stats"] });
      toast.success("Program created");
      setProgramDialogOpen(false);
      setNewProgram({
        name: "",
        year: new Date().getFullYear(),
        status: "draft",
        nominations_open_at: "",
        voting_open_at: "",
        ceremony_at: "",
        primary_color: "#B8860B",
        logo_url: "",
        tagline: "",
        website_url: "",
        organization_name: "",
        external_ticket_url: "",
      });
    },
    onError: () => toast.error("Could not create program"),
  });

  const updateProgram = useMutation({
    mutationFn: async () => {
      if (!selectedProgram || !programDraft) return;
      const { error } = await supabase
        .from("award_programs")
        .update({
          name: programDraft.name.trim(),
          year: programDraft.year,
          status: programDraft.status,
          nominations_open_at: programDraft.nominations_open_at
            ? new Date(programDraft.nominations_open_at).toISOString()
            : null,
          voting_open_at: programDraft.voting_open_at ? new Date(programDraft.voting_open_at).toISOString() : null,
          ceremony_at: programDraft.ceremony_at || null,
          primary_color: programDraft.primary_color.trim() || "#B8860B",
          logo_url: programDraft.logo_url.trim() || null,
          tagline: programDraft.tagline.trim() || null,
          website_url: programDraft.website_url.trim() || null,
          organization_name: programDraft.organization_name.trim() || null,
        })
        .eq("id", selectedProgram.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["award-programs"] });
      queryClient.invalidateQueries({ queryKey: ["award-program-sidebar-stats"] });
      toast.success("Program saved");
      setProgramEditing(false);
      setProgramDraft(null);
    },
    onError: () => toast.error("Could not save program"),
  });

  const addCategoriesBatch = useMutation({
    mutationFn: async () => {
      const pid = resolvedProgramId;
      if (!pid) throw new Error("No program");
      const existing = new Set(categories.map((c) => c.slug));
      const rows: Database["public"]["Tables"]["award_categories"]["Insert"][] = [];
      let order = categories.length;
      for (const slug of presetChipSlugs) {
        const preset = SEEDED_CATEGORY_PRESETS.find((p) => p.slug === slug);
        if (!preset || existing.has(preset.slug)) continue;
        rows.push({
          program_id: pid,
          name: preset.name,
          slug: preset.slug,
          description: preset.description,
          sort_order: order++,
        });
        existing.add(preset.slug);
      }
      if (customCategoryName.trim()) {
        const name = customCategoryName.trim();
        const slug = slugify(name);
        if (existing.has(slug)) throw new Error("A category with this slug already exists.");
        rows.push({
          program_id: pid,
          name,
          slug,
          description: null,
          sort_order: order++,
        });
      }
      if (!rows.length) throw new Error("Nothing to add");
      const { error } = await supabase.from("award_categories").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["award-categories", resolvedProgramId] });
      queryClient.invalidateQueries({ queryKey: ["award-vote-agg"] });
      queryClient.invalidateQueries({ queryKey: ["award-program-sidebar-stats"] });
      toast.success("Categories added");
      setCategoryDialogOpen(false);
      setPresetChipSlugs(new Set());
      setCustomCategoryName("");
    },
    onError: (e: Error) => toast.error(e.message || "Could not add categories"),
  });

  const updateCategory = useMutation({
    mutationFn: async () => {
      if (!editCategoryTarget) return;
      const { error } = await supabase
        .from("award_categories")
        .update({
          name: editCategoryDraft.name.trim(),
          description: editCategoryDraft.description.trim() || null,
        })
        .eq("id", editCategoryTarget.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["award-categories", resolvedProgramId] });
      queryClient.invalidateQueries({ queryKey: ["award-categories", leaderboardProgramId] });
      toast.success("Category updated");
      setEditCategoryTarget(null);
    },
    onError: () => toast.error("Could not update category"),
  });

  const deleteCategory = useMutation({
    mutationFn: async () => {
      if (!deleteCategoryTarget) return;
      const { error } = await supabase.from("award_categories").delete().eq("id", deleteCategoryTarget.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["award-categories", resolvedProgramId] });
      queryClient.invalidateQueries({ queryKey: ["award-categories", leaderboardProgramId] });
      queryClient.invalidateQueries({ queryKey: ["award-vote-agg"] });
      queryClient.invalidateQueries({ queryKey: ["award-program-sidebar-stats"] });
      toast.success("Category deleted");
      setDeleteCategoryTarget(null);
    },
    onError: () => toast.error("Could not delete category"),
  });

  const lbProgram = useMemo(
    () => programs.find((p) => p.id === leaderboardProgramId) ?? null,
    [programs, leaderboardProgramId],
  );

  const lbCategories = useQuery({
    queryKey: ["award-categories", leaderboardProgramId],
    queryFn: async () => {
      if (!leaderboardProgramId) return [];
      const { data, error } = await supabase
        .from("award_categories")
        .select("*")
        .eq("program_id", leaderboardProgramId)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data as AwardCategory[];
    },
    enabled: !!leaderboardProgramId,
  });

  const leaderboardCategory = useMemo(
    () => lbCategories.data?.find((c) => c.id === leaderboardCategoryId) ?? null,
    [lbCategories.data, leaderboardCategoryId],
  );

  const leaderboardRows = useQuery({
    queryKey: ["vote-leaderboard", leaderboardProgramId, leaderboardCategoryId],
    queryFn: async () => {
      if (!lbProgram || !leaderboardCategoryId) return [];
      const cat = lbCategories.data?.find((c) => c.id === leaderboardCategoryId);
      if (!cat) return [];

      const { data: counts, error } = await supabase
        .from("vote_counts")
        .select("vote_count, podcast_id")
        .eq("year", lbProgram.year)
        .eq("program_id", lbProgram.id)
        .eq("category_id", cat.slug);
      if (error) throw error;
      if (!counts?.length) return [];

      const ids = [...new Set(counts.map((c) => c.podcast_id))];
      const [{ data: pods }, { data: profs }] = await Promise.all([
        supabase.from("podcasts").select("id, title, author").in("id", ids),
        supabase.from("profiles").select("podcast_id, full_name").in("podcast_id", ids),
      ]);

      const podMap = new Map((pods ?? []).map((p) => [p.id, p]));
      const nameMap = new Map((profs ?? []).map((p) => [p.podcast_id as string, p.full_name]));

      const total = counts.reduce((s, r) => s + r.vote_count, 0);
      const merged = counts.map((row) => {
        const pod = podMap.get(row.podcast_id);
        const podcaster = nameMap.get(row.podcast_id) || pod?.author || "—";
        return {
          podcastId: row.podcast_id,
          title: pod?.title ?? "Unknown podcast",
          podcaster,
          votes: row.vote_count,
          pct: total > 0 ? (row.vote_count / total) * 100 : 0,
        };
      });
      merged.sort((a, b) => b.votes - a.votes);
      return merged.map((row, i) => ({ ...row, rank: i + 1 }));
    },
    enabled: !!lbProgram && !!leaderboardCategoryId,
    refetchInterval: 15_000,
  });

  const adminVotersFlat = useQuery({
    queryKey: ["admin-voters-flat", lbProgram?.id, leaderboardCategory?.slug],
    queryFn: async () => {
      if (!lbProgram || !leaderboardCategory) return [];
      const { data, error } = await supabase.rpc("admin_category_votes_flat", {
        p_program_id: lbProgram.id,
        p_category_slug: leaderboardCategory.slug,
      });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!lbProgram && !!leaderboardCategory,
    refetchInterval: 15_000,
  });

  const exportLeaderboardCsv = () => {
    const rows = leaderboardRows.data ?? [];
    const voters = adminVotersFlat.data ?? [];
    if (!rows.length && !voters.length) {
      toast.error("Nothing to export");
      return;
    }
    const leaderboardLines = [
      ["rank", "podcast", "podcaster", "votes", "percent"].join(","),
      ...rows.map((r) =>
        [r.rank, csvEscape(r.title), csvEscape(r.podcaster), r.votes, r.pct.toFixed(2)].join(","),
      ),
    ];
    const voterLines = [
      "",
      "voter_email,voter_name,nominee_podcast,nominee_id,vote_slot,voted_at",
      ...voters.map((v) =>
        [
          csvEscape(v.voter_email ?? ""),
          csvEscape(v.voter_name ?? ""),
          csvEscape(v.nominee_podcast ?? ""),
          v.nominee_id,
          v.vote_slot,
          v.voted_at,
        ].join(","),
      ),
    ];
    const blob = new Blob([[...leaderboardLines, ...voterLines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `vpa-votes-${lbProgram?.year ?? "year"}-${leaderboardCategory?.slug ?? "category"}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("CSV downloaded");
  };

  useEffect(() => {
    if (!programs.length) return;
    setSelectedProgramId((prev) => {
      if (prev && programs.some((p) => p.id === prev)) return prev;
      const active = programs.find((p) => p.status === "active");
      return active?.id ?? programs[0].id;
    });
  }, [programs]);

  useEffect(() => {
    if (resolvedProgramId) {
      setLeaderboardProgramId(resolvedProgramId);
    }
  }, [resolvedProgramId]);

  useEffect(() => {
    const list = lbCategories.data;
    if (!list?.length) return;
    const stillValid = leaderboardCategoryId && list.some((c) => c.id === leaderboardCategoryId);
    if (!leaderboardCategoryId || !stillValid) {
      setLeaderboardCategoryId(list[0].id);
    }
  }, [lbCategories.data, leaderboardCategoryId]);

  const beginProgramEdit = () => {
    if (!selectedProgram) return;
    setProgramDraft({
      name: selectedProgram.name,
      year: selectedProgram.year,
      status: selectedProgram.status,
      nominations_open_at: toDatetimeLocal(selectedProgram.nominations_open_at),
      voting_open_at: toDatetimeLocal(selectedProgram.voting_open_at),
      ceremony_at: toDateInput(selectedProgram.ceremony_at),
      primary_color: selectedProgram.primary_color?.trim() || "#B8860B",
      logo_url: selectedProgram.logo_url ?? "",
      tagline: selectedProgram.tagline ?? "",
      website_url: selectedProgram.website_url ?? "",
      organization_name: selectedProgram.organization_name ?? "",
    });
    setProgramEditing(true);
  };

  const cancelProgramEdit = () => {
    setProgramEditing(false);
    setProgramDraft(null);
  };

  const existingSlugSet = useMemo(() => new Set(categories.map((c) => c.slug)), [categories]);

  return (
    <div className="text-sm text-foreground">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        {/* Mobile program selector */}
        <div className="lg:hidden">
          <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Award program
          </Label>
          <Select
            value={resolvedProgramId ?? ""}
            onValueChange={(v) => setSelectedProgramId(v)}
            disabled={!programs.length}
          >
            <SelectTrigger
              className="h-12 rounded-xl border-[#B8860B]/30 bg-card shadow-sm"
              style={{ borderColor: `${GOLD}55` }}
            >
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sidebar — programs */}
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="flex items-center justify-between gap-2 pb-4">
            <h2 className="text-base font-semibold tracking-tight">🏆 Award Programs</h2>
            <Button
              size="sm"
              className="h-8 rounded-lg bg-[#B8860B] text-white shadow hover:bg-[#9a7209]"
              onClick={() => setProgramDialogOpen(true)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> New
            </Button>
          </div>

          {loadingPrograms ? (
            <p className="text-muted-foreground">Loading programs…</p>
          ) : programs.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-2 border-[#B8860B]/25 bg-muted/20 p-8 text-center shadow-none">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#B8860B]/10 text-4xl">
                🏆
              </div>
              <p className="font-medium text-foreground">No programs yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first award program to manage categories and voting.
              </p>
              <Button
                className="mt-4 bg-[#B8860B] text-white hover:bg-[#9a7209]"
                size="sm"
                onClick={() => setProgramDialogOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" /> New program
              </Button>
            </Card>
          ) : (
            <ScrollArea className="h-[min(70vh,720px)] pr-3">
              <div className="space-y-3">
                {programs.map((p) => {
                  const selected = resolvedProgramId === p.id;
                  const st = sidebarStats?.[p.id];
                  const accent = p.primary_color?.trim() || "#B8860B";
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProgramId(p.id)}
                      className={cn(
                        "w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md",
                        selected
                          ? "border-[#B8860B]/50 bg-[#B8860B]/8 pl-[13px] shadow-md ring-1 ring-[#B8860B]/20"
                          : "border-border/80 pl-4 hover:border-[#B8860B]/30",
                        !selected && "border-l-4 border-l-transparent",
                        selected && "border-l-[3px] border-l-[#B8860B]",
                      )}
                    >
                      <div className="flex gap-3">
                        {p.logo_url ? (
                          <img
                            src={p.logo_url}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-lg object-contain"
                          />
                        ) : (
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl"
                            style={{ backgroundColor: `${accent}18`, color: accent }}
                          >
                            🏆
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-[15px] font-semibold leading-snug text-foreground">{p.name}</p>
                          {p.organization_name && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{p.organization_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {p.year}
                        </span>
                        {statusPill(p.status)}
                      </div>
                      {p.tagline && (
                        <p className="mt-2 line-clamp-2 text-xs italic text-muted-foreground">{p.tagline}</p>
                      )}
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                        Nominations: {formatShortDate(p.nominations_open_at)} · Voting:{" "}
                        {formatShortDate(p.voting_open_at)} · Ceremony: {formatShortDate(p.ceremony_at)}
                      </p>
                      {st && (
                        <p className="mt-2 text-xs text-foreground/90">
                          <span className="font-semibold tabular-nums text-[#B8860B]">{st.categories}</span>{" "}
                          categories ·{" "}
                          <span className="font-semibold tabular-nums text-blue-600 dark:text-blue-400">{st.nominees}</span>{" "}
                          nominees ·{" "}
                          <span className="font-semibold tabular-nums text-amber-800 dark:text-amber-300">
                            {st.votes}
                          </span>{" "}
                          votes
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 space-y-10">
          {!selectedProgram ? (
            <p className="text-muted-foreground">Select a program to view details.</p>
          ) : (
            <>
              {/* Section 1 — Program header */}
              <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-md">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      {!programEditing ? (
                        <>
                          <div className="flex flex-wrap items-center gap-3">
                            <h1 className="break-words text-2xl font-bold tracking-tight text-foreground sm:text-[24px]">
                              {selectedProgram.name}
                            </h1>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0 rounded-lg text-[#B8860B] hover:bg-[#B8860B]/10"
                              onClick={beginProgramEdit}
                              aria-label="Edit program"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">Season {selectedProgram.year}</p>
                        </>
                      ) : (
                        programDraft && (
                          <div className="space-y-3">
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={programDraft.name}
                                onChange={(e) => setProgramDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                                className="mt-1 text-base font-semibold"
                              />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <Label>Year</Label>
                                <Input
                                  type="number"
                                  value={programDraft.year}
                                  onChange={(e) =>
                                    setProgramDraft((d) =>
                                      d ? { ...d, year: Number(e.target.value) } : d,
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Status</Label>
                                <Select
                                  value={programDraft.status}
                                  onValueChange={(v) =>
                                    setProgramDraft((d) =>
                                      d ? { ...d, status: v as ProgramStatus } : d,
                                    )
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <Label>Nominations open</Label>
                                <Input
                                  type="datetime-local"
                                  value={programDraft.nominations_open_at}
                                  onChange={(e) =>
                                    setProgramDraft((d) =>
                                      d ? { ...d, nominations_open_at: e.target.value } : d,
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Voting open</Label>
                                <Input
                                  type="datetime-local"
                                  value={programDraft.voting_open_at}
                                  onChange={(e) =>
                                    setProgramDraft((d) =>
                                      d ? { ...d, voting_open_at: e.target.value } : d,
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Ceremony date</Label>
                              <Input
                                type="date"
                                value={programDraft.ceremony_at}
                                onChange={(e) =>
                                  setProgramDraft((d) =>
                                    d ? { ...d, ceremony_at: e.target.value } : d,
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <Label>Primary color</Label>
                                <div className="mt-1 flex gap-2">
                                  <Input
                                    type="color"
                                    className="h-10 w-14 cursor-pointer p-1"
                                    value={programDraft.primary_color}
                                    onChange={(e) =>
                                      setProgramDraft((d) =>
                                        d ? { ...d, primary_color: e.target.value } : d,
                                      )
                                    }
                                  />
                                  <Input
                                    value={programDraft.primary_color}
                                    onChange={(e) =>
                                      setProgramDraft((d) =>
                                        d ? { ...d, primary_color: e.target.value } : d,
                                      )
                                    }
                                    placeholder="#B8860B"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Logo URL</Label>
                                <Input
                                  value={programDraft.logo_url}
                                  onChange={(e) =>
                                    setProgramDraft((d) =>
                                      d ? { ...d, logo_url: e.target.value } : d,
                                    )
                                  }
                                  placeholder="https://…"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Tagline</Label>
                              <Input
                                value={programDraft.tagline}
                                onChange={(e) =>
                                  setProgramDraft((d) =>
                                    d ? { ...d, tagline: e.target.value } : d,
                                  )
                                }
                                className="mt-1"
                                placeholder="Short public tagline"
                              />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <Label>Organization name</Label>
                                <Input
                                  value={programDraft.organization_name}
                                  onChange={(e) =>
                                    setProgramDraft((d) =>
                                      d ? { ...d, organization_name: e.target.value } : d,
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Website URL</Label>
                                <Input
                                  value={programDraft.website_url}
                                  onChange={(e) =>
                                    setProgramDraft((d) =>
                                      d ? { ...d, website_url: e.target.value } : d,
                                    )
                                  }
                                  className="mt-1"
                                  placeholder="https://"
                                />
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Button
                                className="bg-[#B8860B] text-white hover:bg-[#9a7209]"
                                disabled={updateProgram.isPending}
                                onClick={() => updateProgram.mutate()}
                              >
                                Save changes
                              </Button>
                              <Button variant="outline" onClick={cancelProgramEdit}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    {!programEditing && (
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {statusPill(selectedProgram.status)}
                      </div>
                    )}
                  </div>

                  {!programEditing && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <div className="rounded-full border border-[#B8860B]/25 bg-[#B8860B]/5 px-4 py-2 text-sm font-medium text-foreground">
                        <span className="text-[#B8860B]">{categories.length}</span> Categories
                      </div>
                      <div className="rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-2 text-sm font-medium">
                        <span className="text-blue-600 dark:text-blue-400">{totalNomineesProgram}</span> Nominees
                      </div>
                      <div className="rounded-full border border-amber-500/25 bg-amber-500/5 px-4 py-2 text-sm font-medium">
                        <span className="text-amber-700 dark:text-amber-400">{totalVotesProgram}</span> Total votes
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section 2 — Categories */}
              <section className="space-y-4">
                <SectionHeader
                  title="Award Categories"
                  action={
                    <Button
                      size="sm"
                      className="h-9 rounded-lg bg-[#B8860B] text-white shadow hover:bg-[#9a7209]"
                      onClick={() => {
                        setPresetChipSlugs(new Set());
                        setCustomCategoryName("");
                        setCategoryDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-1 h-4 w-4" /> Add Category
                    </Button>
                  }
                />
                <div className="pt-2">
                  {loadingCategories ? (
                    <p className="text-muted-foreground">Loading categories…</p>
                  ) : categories.length === 0 ? (
                    <Card className="rounded-2xl border-dashed border-2 border-border bg-muted/20 py-12 text-center shadow-none">
                      <Sparkles className="mx-auto mb-2 h-8 w-8 text-[#B8860B]/70" />
                      <p className="font-medium">No categories yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Click <span className="font-medium text-[#B8860B]">Add Category</span> to get started.
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {categories.map((cat) => {
                        const totalVotes = voteAgg?.votes[cat.slug] ?? 0;
                        const nomCount = voteAgg?.nominations[cat.id] ?? 0;
                        return (
                          <Card
                            key={cat.id}
                            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 items-start gap-3">
                                  <span className="text-2xl leading-none" aria-hidden>
                                    {categoryEmoji(cat.slug)}
                                  </span>
                                  <div className="min-w-0">
                                    <h4 className="text-lg font-bold leading-tight text-foreground">{cat.name}</h4>
                                    {cat.description && (
                                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{cat.description}</p>
                                    )}
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 shrink-0 rounded-lg opacity-70 hover:opacity-100"
                                      aria-label="Category actions"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditCategoryTarget(cat);
                                        setEditCategoryDraft({
                                          name: cat.name,
                                          description: cat.description ?? "",
                                        });
                                      }}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" /> Edit name
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => setDeleteCategoryTarget(cat)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <Badge className="rounded-md bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:text-blue-300">
                                  {nomCount} nominees
                                </Badge>
                                <Badge
                                  className="rounded-md px-2.5 py-1 text-xs font-medium text-amber-900 ring-1 ring-inset dark:text-amber-100"
                                  style={{
                                    backgroundColor: `${GOLD}22`,
                                    borderColor: `${GOLD}44`,
                                  }}
                                >
                                  {totalVotes} votes
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* Section 3 — Leaderboard */}
              <section className="space-y-4">
                <div className={cn("flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between", GOLD_RING, "pl-4")}>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold tracking-tight">Live Vote Leaderboard</h3>
                    <span className="text-lg" aria-hidden>
                      🔴
                    </span>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("shrink-0 rounded-lg border-[#B8860B]/40 hover:bg-[#B8860B]/10")}
                    onClick={exportLeaderboardCsv}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>

                <div className="pt-2">
                  {!lbCategories.data?.length ? (
                    <p className="text-sm text-muted-foreground">Add categories to see the leaderboard.</p>
                  ) : (
                    <div className="space-y-0">
                    <Tabs
                      value={leaderboardCategoryId ?? ""}
                      onValueChange={(v) => setLeaderboardCategoryId(v)}
                      className="w-full"
                    >
                      <div className="mb-4 overflow-x-auto pb-1">
                        <TabsList className="inline-flex h-auto min-h-10 w-max flex-wrap gap-1 bg-muted/60 p-1">
                          {(lbCategories.data ?? []).map((c) => (
                            <TabsTrigger
                              key={c.id}
                              value={c.id}
                              className="rounded-md px-3 py-2 text-xs data-[state=active]:bg-[#B8860B] data-[state=active]:text-white sm:text-sm"
                            >
                              {c.name}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>
                    </Tabs>
                    <Card className="rounded-2xl border-border/80 shadow-md">
                      <CardContent className="p-0">
                        {leaderboardRows.isLoading ? (
                          <div className="p-8 text-center text-muted-foreground">Loading…</div>
                        ) : !leaderboardRows.data?.length ? (
                          <div className="p-12 text-center text-muted-foreground">
                            <Vote className="mx-auto mb-2 h-10 w-10 opacity-40" />
                            <p className="font-medium text-foreground">No votes yet</p>
                            <p className="text-xs">Votes will appear here as they come in.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-border/60">
                            {leaderboardRows.data.map((row) => (
                              <div
                                key={row.podcastId}
                                className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:gap-4"
                              >
                                <div className="flex w-12 shrink-0 justify-center text-lg font-semibold tabular-nums">
                                  {row.rank <= 3 ? (
                                    <span aria-hidden>
                                      {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : "🥉"}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">{row.rank}</span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-foreground">{row.title}</p>
                                  <p className="text-xs text-muted-foreground">{row.podcaster}</p>
                                  <div className="mt-2 h-2 max-w-md overflow-hidden rounded-full bg-muted">
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width: `${row.pct}%`,
                                        backgroundColor: GOLD,
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="text-right sm:w-24">
                                  <p className="font-mono text-base font-semibold tabular-nums">{row.votes}</p>
                                  <p className="text-xs text-muted-foreground">{row.pct.toFixed(1)}%</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    </div>
                  )}
                </div>
              </section>

              <AwardTicketsAdmin programId={resolvedProgramId} program={selectedProgram} />
            </>
          )}
        </main>
      </div>

      {/* New program dialog */}
      <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New award program</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="ap-name">Name</Label>
              <Input
                id="ap-name"
                value={newProgram.name}
                onChange={(e) => setNewProgram((s) => ({ ...s, name: e.target.value }))}
                placeholder="e.g. MVA Awards 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ap-year">Year</Label>
                <Input
                  id="ap-year"
                  type="number"
                  value={newProgram.year}
                  onChange={(e) => setNewProgram((s) => ({ ...s, year: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={newProgram.status}
                  onValueChange={(v) => setNewProgram((s) => ({ ...s, status: v as ProgramStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="ap-nom">Nominations open (local)</Label>
              <Input
                id="ap-nom"
                type="datetime-local"
                value={newProgram.nominations_open_at}
                onChange={(e) => setNewProgram((s) => ({ ...s, nominations_open_at: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ap-vote">Voting open (local)</Label>
              <Input
                id="ap-vote"
                type="datetime-local"
                value={newProgram.voting_open_at}
                onChange={(e) => setNewProgram((s) => ({ ...s, voting_open_at: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ap-cer">Ceremony date</Label>
              <Input
                id="ap-cer"
                type="date"
                value={newProgram.ceremony_at}
                onChange={(e) => setNewProgram((s) => ({ ...s, ceremony_at: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="ap-color">Primary color</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    id="ap-color"
                    type="color"
                    className="h-10 w-14 cursor-pointer p-1"
                    value={newProgram.primary_color}
                    onChange={(e) => setNewProgram((s) => ({ ...s, primary_color: e.target.value }))}
                  />
                  <Input
                    value={newProgram.primary_color}
                    onChange={(e) => setNewProgram((s) => ({ ...s, primary_color: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ap-logo">Logo URL</Label>
                <Input
                  id="ap-logo"
                  value={newProgram.logo_url}
                  onChange={(e) => setNewProgram((s) => ({ ...s, logo_url: e.target.value }))}
                  placeholder="https://…"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ap-tag">Tagline</Label>
              <Input
                id="ap-tag"
                value={newProgram.tagline}
                onChange={(e) => setNewProgram((s) => ({ ...s, tagline: e.target.value }))}
                placeholder="Honoring the voices of…"
                className="mt-1"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="ap-org">Organization name</Label>
                <Input
                  id="ap-org"
                  value={newProgram.organization_name}
                  onChange={(e) => setNewProgram((s) => ({ ...s, organization_name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ap-web">Website URL</Label>
                <Input
                  id="ap-web"
                  value={newProgram.website_url}
                  onChange={(e) => setNewProgram((s) => ({ ...s, website_url: e.target.value }))}
                  placeholder="https://"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ap-ext-tix">External ticket URL (optional)</Label>
              <Input
                id="ap-ext-tix"
                value={newProgram.external_ticket_url}
                onChange={(e) => setNewProgram((s) => ({ ...s, external_ticket_url: e.target.value }))}
                placeholder="https://eventbrite.com/..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgramDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#B8860B] text-white hover:bg-[#9a7209]"
              disabled={!newProgram.name.trim() || createProgram.isPending}
              onClick={() => createProgram.mutate()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add categories — chips + custom */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Select preset categories (seeded list). Already added slugs are disabled.
            </p>
            <div className="flex flex-wrap gap-2">
              {SEEDED_CATEGORY_PRESETS.map((preset) => {
                const has = existingSlugSet.has(preset.slug);
                const selected = presetChipSlugs.has(preset.slug);
                return (
                  <button
                    key={preset.slug}
                    type="button"
                    disabled={has}
                    onClick={() => {
                      if (has) return;
                      setPresetChipSlugs((prev) => {
                        const next = new Set(prev);
                        if (next.has(preset.slug)) next.delete(preset.slug);
                        else next.add(preset.slug);
                        return next;
                      });
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      has && "cursor-not-allowed opacity-50",
                      has && "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
                      !has && selected && "border-[#B8860B] bg-[#B8860B]/15 text-foreground shadow-sm",
                      !has && !selected && "border-border hover:border-[#B8860B]/50",
                    )}
                  >
                    {has ? "✓ " : ""}
                    {preset.name}
                  </button>
                );
              })}
            </div>
            <div>
              <Label htmlFor="custom-cat">Custom category</Label>
              <Input
                id="custom-cat"
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                placeholder="Type a name — slug is generated automatically"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#B8860B] text-white hover:bg-[#9a7209]"
              disabled={addCategoriesBatch.isPending || (!presetChipSlugs.size && !customCategoryName.trim())}
              onClick={() => addCategoriesBatch.mutate()}
            >
              Add selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit category */}
      <Dialog open={!!editCategoryTarget} onOpenChange={(o) => !o && setEditCategoryTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={editCategoryDraft.name}
                onChange={(e) => setEditCategoryDraft((d) => ({ ...d, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editCategoryDraft.description}
                onChange={(e) => setEditCategoryDraft((d) => ({ ...d, description: e.target.value }))}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategoryTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-[#B8860B] text-white hover:bg-[#9a7209]"
              disabled={!editCategoryDraft.name.trim() || updateCategory.isPending}
              onClick={() => updateCategory.mutate()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteCategoryTarget} onOpenChange={(o) => !o && setDeleteCategoryTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes &quot;{deleteCategoryTarget?.name}&quot; from this program. Votes referencing this category
              slug may become orphaned — only delete if you are sure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteCategory.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Plus, Trophy } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type AwardProgram = Database["public"]["Tables"]["award_programs"]["Row"];
type AwardCategory = Database["public"]["Tables"]["award_categories"]["Row"];
type ProgramStatus = Database["public"]["Enums"]["award_program_status"];

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

function statusBadge(status: ProgramStatus) {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-600/20 text-emerald-700 dark:text-emerald-400">Active</Badge>;
    case "closed":
      return <Badge variant="secondary">Closed</Badge>;
    default:
      return <Badge variant="outline">Draft</Badge>;
  }
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

/** DB may use *_at or *_date column names depending on migration / manual edits */
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

export const AwardsManager = () => {
  const queryClient = useQueryClient();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [nomineesCategory, setNomineesCategory] = useState<AwardCategory | null>(null);
  const [leaderboardProgramId, setLeaderboardProgramId] = useState<string | null>(null);
  const [leaderboardCategoryId, setLeaderboardCategoryId] = useState<string | null>(null);

  const [newProgram, setNewProgram] = useState({
    name: "",
    year: new Date().getFullYear(),
    status: "draft" as ProgramStatus,
    nominations_open_at: "",
    voting_open_at: "",
    ceremony_at: "",
  });

  const [newCategory, setNewCategory] = useState({ name: "", description: "", slug: "" });

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

  /** Prefer explicit row selection; otherwise active program, then first row */
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
    queryKey: ["award-vote-agg", programYear, categorySlugs.join("|"), categoryIds.join("|")],
    queryFn: async () => {
      if (!programYear || categorySlugs.length === 0) return { votes: {}, nominations: {} };
      const [vc, nom] = await Promise.all([
        supabase
          .from("vote_counts")
          .select("category_id, vote_count")
          .eq("year", programYear)
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
    enabled: !!programYear && categories.length > 0,
  });

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
      };
      const { error } = await supabase.from("award_programs").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["award-programs"] });
      toast.success("Program created");
      setProgramDialogOpen(false);
      setNewProgram({
        name: "",
        year: new Date().getFullYear(),
        status: "draft",
        nominations_open_at: "",
        voting_open_at: "",
        ceremony_at: "",
      });
    },
    onError: () => toast.error("Could not create program"),
  });

  const createCategory = useMutation({
    mutationFn: async () => {
      if (!selectedProgramId) return;
      const slug = newCategory.slug.trim() || slugify(newCategory.name);
      const { error } = await supabase.from("award_categories").insert({
        program_id: selectedProgramId,
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || null,
        slug,
        sort_order: categories.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["award-categories", selectedProgramId] });
      queryClient.invalidateQueries({ queryKey: ["award-vote-agg"] });
      toast.success("Category added");
      setCategoryDialogOpen(false);
      setNewCategory({ name: "", description: "", slug: "" });
    },
    onError: () => toast.error("Could not add category (check slug is unique for this program)"),
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
    queryKey: ["admin-voters-flat", lbProgram?.year, leaderboardCategory?.slug],
    queryFn: async () => {
      if (!lbProgram || !leaderboardCategory) return [];
      const { data, error } = await supabase.rpc("admin_category_votes_flat", {
        p_year: lbProgram.year,
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

  const nomineesModal = useQuery({
    queryKey: ["category-nominees", nomineesCategory?.id, selectedProgram?.year, nomineesCategory?.slug],
    queryFn: async () => {
      if (!nomineesCategory || !selectedProgram) return [];
      const { data: counts, error } = await supabase
        .from("vote_counts")
        .select("vote_count, podcast_id")
        .eq("year", selectedProgram.year)
        .eq("category_id", nomineesCategory.slug);
      if (error) throw error;
      if (!counts?.length) return [];

      const ids = [...new Set(counts.map((c) => c.podcast_id))];
      const [{ data: pods }, { data: profs }] = await Promise.all([
        supabase.from("podcasts").select("id, title, author").in("id", ids),
        supabase.from("profiles").select("podcast_id, full_name").in("podcast_id", ids),
      ]);
      const podMap = new Map((pods ?? []).map((p) => [p.id, p]));
      const nameMap = new Map((profs ?? []).map((p) => [p.podcast_id as string, p.full_name]));

      const rows = counts.map((row) => {
        const pod = podMap.get(row.podcast_id);
        const podcaster = nameMap.get(row.podcast_id) || pod?.author || "—";
        return {
          title: pod?.title ?? "Unknown",
          podcaster,
          votes: row.vote_count,
        };
      });
      rows.sort((a, b) => b.votes - a.votes);
      return rows.map((r, i) => ({ ...r, rank: i + 1 }));
    },
    enabled: !!nomineesCategory && !!selectedProgram,
  });

  useEffect(() => {
    if (!programs.length) return;
    setSelectedProgramId((prev) => {
      if (prev && programs.some((p) => p.id === prev)) return prev;
      const active = programs.find((p) => p.status === "active");
      return active?.id ?? programs[0].id;
    });
  }, [programs]);

  useEffect(() => {
    if (!leaderboardProgramId && programs.length) {
      setLeaderboardProgramId(programs[0].id);
    }
  }, [programs, leaderboardProgramId]);

  useEffect(() => {
    const list = lbCategories.data;
    if (!list?.length) return;
    const stillValid = leaderboardCategoryId && list.some((c) => c.id === leaderboardCategoryId);
    if (!leaderboardCategoryId || !stillValid) {
      setLeaderboardCategoryId(list[0].id);
    }
  }, [lbCategories.data, leaderboardCategoryId]);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Award programs
          </h2>
          <Button size="sm" onClick={() => setProgramDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New program
          </Button>
        </div>
        {loadingPrograms ? (
          <p className="text-muted-foreground text-sm">Loading programs…</p>
        ) : programs.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            No award programs yet. Create one to manage categories and voting.
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Nominations open</TableHead>
                  <TableHead className="hidden md:table-cell">Voting open</TableHead>
                  <TableHead className="hidden lg:table-cell">Ceremony</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((p) => (
                  <TableRow
                    key={p.id}
                    data-state={resolvedProgramId === p.id ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => setSelectedProgramId(p.id)}
                  >
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.year}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {formatDateTime(p.nominations_open_at)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {formatDateTime(p.voting_open_at)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {formatDateOnly(p.ceremony_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Select a program row to load its categories and nomination stats.
        </p>
      </div>

      {selectedProgram && (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div>
              <h3 className="font-serif text-lg font-semibold">{selectedProgram.name}</h3>
              <p className="text-sm text-muted-foreground">Categories for {selectedProgram.year}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setCategoryDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add category
            </Button>
          </div>

          {loadingCategories ? (
            <p className="text-muted-foreground text-sm">Loading categories…</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories for this program yet.</p>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => {
                const totalVotes = voteAgg?.votes[cat.slug] ?? 0;
                const nomCount = voteAgg?.nominations[cat.id] ?? 0;
                return (
                  <div
                    key={cat.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{cat.name}</span>
                        <Badge variant="default" className="font-mono tabular-nums">
                          {totalVotes} votes
                        </Badge>
                      </div>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Nominations recorded: {nomCount} · slug:{" "}
                        <code className="text-[11px] bg-muted px-1 rounded">{cat.slug}</code>
                      </p>
                    </div>
                    <Button variant="link" className="shrink-0 px-0 sm:px-4" onClick={() => setNomineesCategory(cat)}>
                      View nominees
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-border pt-8">
        <h3 className="font-serif text-lg font-semibold mb-1">Vote summary</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Live tally (refreshes every 15s). Top three ranks are highlighted. Filter by program and category; sorted by
          votes descending.
        </p>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="space-y-1">
            <Label className="text-xs">Program</Label>
            <Select
              value={leaderboardProgramId ?? ""}
              onValueChange={(v) => {
                setLeaderboardProgramId(v);
                setLeaderboardCategoryId(null);
              }}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Program" />
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
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select
              value={leaderboardCategoryId ?? ""}
              onValueChange={setLeaderboardCategoryId}
              disabled={!leaderboardProgramId || !lbCategories.data?.length}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {(lbCategories.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mb-2">
          <Button type="button" variant="outline" size="sm" onClick={exportLeaderboardCsv}>
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Rank</TableHead>
                <TableHead>Podcast</TableHead>
                <TableHead>Podcaster</TableHead>
                <TableHead className="text-right">Votes</TableHead>
                <TableHead className="text-right">% of total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardRows.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : !leaderboardRows.data?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No votes in this category yet, or category slug does not match stored votes.
                  </TableCell>
                </TableRow>
              ) : (
                leaderboardRows.data.map((row) => (
                  <TableRow
                    key={row.podcastId}
                    className={
                      row.rank === 1
                        ? "bg-amber-500/15"
                        : row.rank === 2
                          ? "bg-slate-400/15"
                          : row.rank === 3
                            ? "bg-orange-700/15"
                            : ""
                    }
                  >
                    <TableCell className="font-mono">
                      <span className="inline-flex items-center gap-1">
                        {row.rank === 1 && <span aria-hidden>🥇</span>}
                        {row.rank === 2 && <span aria-hidden>🥈</span>}
                        {row.rank === 3 && <span aria-hidden>🥉</span>}
                        {row.rank}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell className="text-muted-foreground">{row.podcaster}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{row.votes}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {row.pct.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-sm mb-2">Voters (email & name)</h4>
          <p className="text-xs text-muted-foreground mb-2">
            One row per vote slot (max 3 per voter per category). Requires admin SQL migration{" "}
            <code className="text-[11px]">admin_category_votes_flat</code>.
          </p>
          <div className="rounded-lg border border-border overflow-x-auto max-h-72 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voter email</TableHead>
                  <TableHead>Voter name</TableHead>
                  <TableHead>Voted for</TableHead>
                  <TableHead className="w-16">Slot</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminVotersFlat.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : !adminVotersFlat.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No voter rows (or RPC not deployed yet).
                    </TableCell>
                  </TableRow>
                ) : (
                  adminVotersFlat.data.map((v, i) => (
                    <TableRow key={`${v.nominee_id}-${v.vote_slot}-${i}`}>
                      <TableCell className="text-xs font-mono">{v.voter_email}</TableCell>
                      <TableCell className="text-sm">{v.voter_name || "—"}</TableCell>
                      <TableCell className="text-sm">{v.nominee_podcast}</TableCell>
                      <TableCell className="font-mono text-sm">{v.vote_slot}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(v.voted_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgramDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newProgram.name.trim() || createProgram.isPending}
              onClick={() => createProgram.mutate()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="ac-name">Name</Label>
              <Input
                id="ac-name"
                value={newCategory.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setNewCategory((s) => ({
                    ...s,
                    name,
                    slug: s.slug || slugify(name),
                  }));
                }}
                placeholder="Category title"
              />
            </div>
            <div>
              <Label htmlFor="ac-slug">Slug (stored in votes as category_id)</Label>
              <Input
                id="ac-slug"
                value={newCategory.slug}
                onChange={(e) => setNewCategory((s) => ({ ...s, slug: e.target.value }))}
                placeholder="best-example-show"
              />
            </div>
            <div>
              <Label htmlFor="ac-desc">Description</Label>
              <Textarea
                id="ac-desc"
                value={newCategory.description}
                onChange={(e) => setNewCategory((s) => ({ ...s, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newCategory.name.trim() || createCategory.isPending}
              onClick={() => createCategory.mutate()}
            >
              Add category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!nomineesCategory} onOpenChange={(o) => !o && setNomineesCategory(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nominees — {nomineesCategory?.name}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Podcast</TableHead>
                <TableHead>Podcaster</TableHead>
                <TableHead className="text-right">Votes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nomineesModal.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : !nomineesModal.data?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No vote data for this category yet.
                  </TableCell>
                </TableRow>
              ) : (
                nomineesModal.data.map((row) => (
                  <TableRow key={row.rank}>
                    <TableCell className="font-mono">{row.rank}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{row.podcaster}</TableCell>
                    <TableCell className="text-right font-mono">{row.votes}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

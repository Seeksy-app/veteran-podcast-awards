import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, CheckCircle, Loader2, Trophy, ExternalLink } from "lucide-react";
import { NomineeBadgeCard } from "./NomineeBadgeCard";
import { rankAmongNominees } from "@/lib/awards";

type ProfileLite = {
  id: string;
  full_name: string | null;
  podcast_id: string | null;
  user_type: string | null;
};

type PodcastLite = { id: string; title: string; author: string | null };

interface Props {
  userId: string;
  profile: ProfileLite;
  podcast: PodcastLite | null;
}

export const GetNominatedSection = ({ userId, profile, podcast }: Props) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["nominate-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("award_categories")
        .select("id, slug, name, description, sort_order, award_programs(id, year, status, nominations_open_at)")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return (data ?? []).filter(
        (c: { award_programs?: { status?: string } | null }) => c.award_programs?.status === "active",
      ) as {
        id: string;
        slug: string;
        name: string;
        description: string | null;
        award_programs: { id: string; year: number; status: string; nominations_open_at: string | null };
      }[];
    },
  });

  const existingQuery = useQuery({
    queryKey: ["my-nominations", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("nominations").select("id, category_id").eq("user_id", userId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const shareNominationId = useMemo(() => {
    const rows = existingQuery.data ?? [];
    if (!rows.length) return null;
    return rows[0].id;
  }, [existingQuery.data]);

  const ranksQuery = useQuery({
    queryKey: ["my-nomination-ranks", userId, existingQuery.data?.map((n) => n.category_id).join(",")],
    enabled: Boolean(podcast?.id && (existingQuery.data?.length ?? 0) > 0 && categoriesQuery.data?.length),
    refetchInterval: 45_000,
    queryFn: async () => {
      const catById = new Map((categoriesQuery.data ?? []).map((c) => [c.id, c]));
      const out: { categoryName: string; rank: number; total: number; votes: number }[] = [];
      for (const n of existingQuery.data ?? []) {
        const cat = catById.get(n.category_id);
        if (!cat) continue;
        const r = await rankAmongNominees(podcast!.id, cat.id, cat.slug, cat.award_programs.year);
        out.push({
          categoryName: cat.name,
          rank: r.rank,
          total: r.totalNominees,
          votes: r.votes,
        });
      }
      return out;
    },
  });

  const nominationsOpen = (row: (typeof categoriesQuery.data)[0]) => {
    const t = row.award_programs.nominations_open_at;
    if (!t) return true;
    return new Date(t) <= new Date();
  };

  const nominate = useMutation({
    mutationFn: async () => {
      if (!podcast?.id) throw new Error("No podcast linked");
      const ids = Object.entries(selected)
        .filter(([, on]) => on)
        .map(([id]) => id);
      if (!ids.length) throw new Error("Pick at least one category");
      const podcastName = podcast.title;
      const podcasterName = profile.full_name || podcast.author || "Podcaster";
      const rows = ids.map((category_id) => ({
        user_id: userId,
        category_id,
        podcast_id: podcast.id,
        podcast_name: podcastName,
        podcaster_name: podcasterName,
      }));
      const { error } = await supabase.from("nominations").upsert(rows, {
        onConflict: "user_id,category_id",
        ignoreDuplicates: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("You're on the ballot!");
      setSelected({});
      queryClient.invalidateQueries({ queryKey: ["my-nominations"] });
      queryClient.invalidateQueries({ queryKey: ["my-nomination-ranks"] });
    },
    onError: (e: unknown) => {
      const err = e as { code?: string; message?: string };
      if (err.code === "23505" || err.message?.includes("duplicate")) {
        toast.error("Some categories were already nominated — refreshed.");
      } else {
        toast.error(err.message || "Could not save nominations");
      }
      queryClient.invalidateQueries({ queryKey: ["my-nominations"] });
    },
  });

  const shareUrl =
    typeof window !== "undefined" && shareNominationId
      ? `${window.location.origin}/vote/${shareNominationId}`
      : "";

  if (profile.user_type !== "podcaster" || !podcast) {
    return null;
  }

  const nominatedSet = new Set((existingQuery.data ?? []).map((n) => n.category_id));

  return (
    <div className="space-y-6 mb-10">
      <Card className="border-primary/25 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl">
            <Trophy className="w-6 h-6 text-primary" />
            Get nominated
          </CardTitle>
          <CardDescription>
            Choose one or more categories for <span className="font-medium text-foreground">{podcast.title}</span>.
            You&apos;ll get a shareable voting page for fans.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {categoriesQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !categoriesQuery.data?.length ? (
            <p className="text-sm text-muted-foreground">There are no active award categories open right now.</p>
          ) : (
            <>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {categoriesQuery.data.map((c) => {
                  const already = nominatedSet.has(c.id);
                  const open = nominationsOpen(c);
                  return (
                    <div
                      key={c.id}
                      className="flex items-start gap-3 rounded-lg border border-border/80 p-3 bg-background/60"
                    >
                      <Checkbox
                        id={`cat-${c.id}`}
                        checked={already || Boolean(selected[c.id])}
                        disabled={already || !open}
                        onCheckedChange={(v) => setSelected((s) => ({ ...s, [c.id]: Boolean(v) }))}
                      />
                      <div className="min-w-0 flex-1">
                        <Label htmlFor={`cat-${c.id}`} className="text-sm font-medium leading-tight cursor-pointer">
                          {c.name}
                        </Label>
                        {c.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>
                        )}
                        {already && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                            Already nominated
                          </span>
                        )}
                        {!open && !already && (
                          <span className="text-xs text-amber-600 mt-1 inline-block">Nominations not open yet</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                onClick={() => nominate.mutate()}
                disabled={nominate.isPending || !Object.values(selected).some(Boolean)}
                className="w-full sm:w-auto"
                variant="gold"
              >
                {nominate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit nominations"}
              </Button>
            </>
          )}

          {shareNominationId && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-sm font-medium">Your voting page</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md break-all">{shareUrl}</code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    toast.success("Link copied");
                  }}
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  <span className="ml-2">Copy</span>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <a href={shareUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share <span className="font-mono">veteranpodcastawards.com/vote/{shareNominationId.slice(0, 8)}…</span>{" "}
                on social media so listeners can vote for you (up to 3 votes per category per person).
              </p>
            </div>
          )}

          {shareNominationId && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview</p>
              <div className="rounded-lg border border-dashed border-primary/30 p-2 bg-muted/20 overflow-hidden">
                <iframe title="Voting page preview" src={shareUrl} className="w-full h-[420px] rounded-md bg-background" />
              </div>
            </div>
          )}

          {ranksQuery.data && ranksQuery.data.length > 0 && (
            <div className="rounded-xl border border-border p-4 space-y-2">
              <p className="text-sm font-semibold">Your standings</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {ranksQuery.data.map((r) => (
                  <li key={r.categoryName}>
                    <span className="text-foreground font-medium">{r.categoryName}</span> — You are ranked #{r.rank} of{" "}
                    {r.total} nominees ({r.votes} votes)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {shareNominationId && podcast && profile.full_name && (
            <NomineeBadgeCard podcastTitle={podcast.title} podcasterName={profile.full_name} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

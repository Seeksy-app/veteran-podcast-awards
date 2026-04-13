import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  countVotesForUserInCategory,
  getNextVoteSlot,
  publicCategoryEmoji,
  rankAmongNominees,
} from "@/lib/awards";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Mic } from "lucide-react";
const AwardsCategoryNomineesPage = () => {
  const { programId, categoryId } = useParams<{ programId: string; categoryId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [voteBusy, setVoteBusy] = useState<string | null>(null);
  const [justVoted, setJustVoted] = useState<Record<string, { rank: number; total: number }>>({});

  const programQuery = useQuery({
    queryKey: ["award-program-public", programId],
    enabled: Boolean(programId),
    queryFn: async () => {
      const { data, error } = await supabase.from("award_programs").select("*").eq("id", programId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const categoryQuery = useQuery({
    queryKey: ["award-category-public", programId, categoryId],
    enabled: Boolean(programId && categoryId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("award_categories")
        .select("*")
        .eq("id", categoryId!)
        .eq("program_id", programId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const nomineesQuery = useQuery({
    queryKey: ["awards-category-nominees", categoryId],
    enabled: Boolean(categoryQuery.data?.id),
    refetchInterval: 20_000,
    queryFn: async () => {
      const { data: noms, error } = await supabase
        .from("nominations")
        .select(
          `
          id,
          podcast_id,
          podcast_name,
          podcaster_name,
          user_id,
          podcasts (image_url, title)
        `,
        )
        .eq("category_id", categoryId!);
      if (error) throw error;
      const list = noms ?? [];
      return list.map((n) => ({
        ...n,
        image_url: (n as { podcasts?: { image_url: string | null; title: string } | null }).podcasts?.image_url ?? null,
        title:
          (n as { podcasts?: { image_url: string | null; title: string } | null }).podcasts?.title ?? n.podcast_name,
      }));
    },
  });

  const votesUsed = useQuery({
    queryKey: ["my-votes-cat", user?.id, categoryId, programId],
    enabled: Boolean(user && categoryQuery.data && programId),
    queryFn: async () => {
      const cat = categoryQuery.data!;
      return countVotesForUserInCategory(user!.id, cat.slug, programId!);
    },
  });

  const p = programQuery.data;
  const cat = categoryQuery.data;
  const accent = p?.primary_color?.trim() || "#B8860B";

  const votingOpen = useMemo(() => {
    if (!p?.voting_open_at) return true;
    return new Date(p.voting_open_at) <= new Date();
  }, [p?.voting_open_at]);

  const handleVote = async (nominationId: string, podcastId: string) => {
    if (!user) {
      const returnTo = encodeURIComponent(
        `/awards/${programId}/categories/${categoryId}`,
      );
      navigate(`/auth?mode=signup&intent=voter&returnTo=${returnTo}`);
      return;
    }
    if (!cat || !p) return;
    if (!votingOpen) {
      toast.error("Voting is not open for this program yet.");
      return;
    }
    setVoteBusy(nominationId);
    try {
      const used = votesUsed.data ?? 0;
      if (used >= 3) {
        toast.error("You have already used all 3 votes in this category.");
        return;
      }
      const slot = await getNextVoteSlot(user.id, cat.slug, p.id);
      if (slot === null) {
        toast.error("You have already used all 3 votes in this category.");
        return;
      }
      const { error } = await supabase.from("votes").insert({
        user_id: user.id,
        program_id: p.id,
        category_id: cat.slug,
        nominee_id: podcastId,
        year: p.year,
        vote_slot: slot,
      });
      if (error) {
        if (error.code === "23505") toast.error("Vote slot conflict — try again.");
        else toast.error(error.message);
        return;
      }
      toast.success("Your vote has been cast!");
      const r = await rankAmongNominees(podcastId, cat.id, cat.slug, p.id);
      setJustVoted((prev) => ({ ...prev, [nominationId]: { rank: r.rank, total: r.totalNominees } }));
      await votesUsed.refetch();
    } finally {
      setVoteBusy(null);
    }
  };

  if (!programId || !categoryId) return null;

  if (programQuery.isLoading || categoryQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!p || !cat) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="font-serif text-2xl font-bold">Category not found</h1>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/awards">All programs</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${cat.name} — ${p.name}`}
        description={cat.description ?? `Nominees for ${cat.name}`}
        canonicalUrl={`/awards/${programId}/categories/${categoryId}`}
      />
      <Header />
      <main className="container mx-auto max-w-3xl px-4 pt-24 pb-16">
        <Button variant="ghost" className="mb-6 gap-1" asChild>
          <Link to={`/awards/${programId}/categories`}>
            <ChevronLeft className="h-4 w-4" />
            Categories
          </Link>
        </Button>

        <div className="mb-8" style={{ borderLeftWidth: 4, borderLeftColor: accent, paddingLeft: 16 }}>
          <div className="text-3xl">{publicCategoryEmoji(cat.slug)}</div>
          <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">{cat.name}</h1>
          <p className="text-sm text-muted-foreground">{p.name}</p>
          {cat.description && <p className="mt-2 text-sm text-muted-foreground">{cat.description}</p>}
        </div>

        {nomineesQuery.isLoading || authLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !nomineesQuery.data?.length ? (
          <p className="text-center text-muted-foreground">No nominees in this category yet.</p>
        ) : (
          <div className="space-y-4">
            {nomineesQuery.data.map((n) => {
              const voted = justVoted[n.id];
              const used = votesUsed.data ?? 0;
              return (
                <Card key={n.id} className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <Avatar className="h-20 w-20 shrink-0 border-2 border-border">
                      <AvatarImage src={n.image_url || undefined} alt={n.title} />
                      <AvatarFallback className="bg-secondary">
                        <Mic className="h-8 w-8 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-lg font-semibold">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.podcaster_name}</p>
                      {voted && (
                        <p className="mt-2 text-sm font-medium" style={{ color: accent }}>
                          Currently ranked #{voted.rank} of {voted.total} nominees
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full shrink-0 border-0 text-white sm:w-auto"
                      style={{ backgroundColor: accent }}
                      disabled={!votingOpen || voteBusy === n.id || used >= 3}
                      onClick={() => handleVote(n.id, n.podcast_id)}
                    >
                      {voteBusy === n.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : used >= 3 ? (
                        "Max votes cast"
                      ) : (
                        `Vote for ${n.title}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {user && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {votesUsed.data ?? 0}/3 votes used in this category for {p.name}
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AwardsCategoryNomineesPage;

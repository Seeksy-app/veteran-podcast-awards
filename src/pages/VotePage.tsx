import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  countVotesForUserInCategory,
  getNextVoteSlot,
  isNominationUuid,
  rankAmongNominees,
} from "@/lib/awards";
import { toast } from "sonner";
import { ChevronRight, Loader2, Share2, Trophy } from "lucide-react";

type NomRow = {
  id: string;
  category_id: string;
  podcast_id: string;
  podcast_name: string;
  podcaster_name: string;
  user_id: string;
  award_categories: {
    id: string;
    slug: string;
    name: string;
    program_id: string;
    award_programs: {
      id: string;
      year: number;
      status: string;
      voting_open_at: string | null;
      nominations_open_at: string | null;
    };
  };
};

const VotePage = () => {
  const { nominationId } = useParams<{ nominationId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [legacyRedirecting, setLegacyRedirecting] = useState(false);
  const [voteBusy, setVoteBusy] = useState<string | null>(null);
  const [justVoted, setJustVoted] = useState<Record<string, { rank: number; categoryName: string }>>({});

  const isUuid = isNominationUuid(nominationId);

  const landingQuery = useQuery({
    queryKey: ["vote-landing", nominationId, isUuid],
    enabled: Boolean(nominationId) && isUuid,
    queryFn: async () => {
      const { data: anchor, error } = await supabase
        .from("nominations")
        .select(
          `
          id,
          category_id,
          podcast_id,
          podcast_name,
          podcaster_name,
          user_id,
          award_categories (
            id,
            slug,
            name,
            program_id,
            award_programs (
              id,
              year,
              status,
              voting_open_at,
              nominations_open_at
            )
          )
        `,
        )
        .eq("id", nominationId!)
        .maybeSingle();

      if (error) throw error;
      if (!anchor) return { kind: "not_found" as const };

      const programId = (anchor as NomRow).award_categories?.program_id;
      if (!programId) return { kind: "not_found" as const };

      const { data: allNoms, error: e2 } = await supabase
        .from("nominations")
        .select(
          `
          id,
          category_id,
          podcast_id,
          podcast_name,
          podcaster_name,
          user_id,
          award_categories (
            id,
            slug,
            name,
            program_id,
            award_programs (
              id,
              year,
              status,
              voting_open_at,
              nominations_open_at
            )
          )
        `,
        )
        .eq("user_id", (anchor as NomRow).user_id);

      if (e2) throw e2;

      const rows = (allNoms ?? []).filter((r) => {
        const cat = (r as NomRow).award_categories;
        return cat?.program_id === programId && cat?.award_programs?.status === "active";
      }) as NomRow[];

      const { data: podcast } = await supabase
        .from("podcasts")
        .select("title, image_url, description, author")
        .eq("id", (anchor as NomRow).podcast_id)
        .maybeSingle();

      return {
        kind: "ok" as const,
        anchor: anchor as NomRow,
        nominations: rows,
        podcast,
      };
    },
  });

  useEffect(() => {
    if (!nominationId || isUuid) return;
    (async () => {
      setLegacyRedirecting(true);
      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("custom_voting_link", nominationId)
        .maybeSingle();
      if (!prof?.id) {
        setLegacyRedirecting(false);
        return;
      }
      const { data: first } = await supabase
        .from("nominations")
        .select("id")
        .eq("user_id", prof.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (first?.id) {
        navigate(`/vote/${first.id}`, { replace: true });
        return;
      }
      setLegacyRedirecting(false);
    })();
  }, [nominationId, isUuid, navigate]);

  const programYear = landingQuery.data?.kind === "ok" ? landingQuery.data.anchor.award_categories.award_programs.year : 2026;

  const votesUsedByCategory = useQuery({
    queryKey: ["my-votes-category", user?.id, programYear, nominationId],
    enabled: Boolean(user && landingQuery.data?.kind === "ok"),
    queryFn: async () => {
      if (landingQuery.data?.kind !== "ok" || !user) return {};
      const map: Record<string, number> = {};
      for (const n of landingQuery.data.nominations) {
        const slug = n.award_categories.slug;
        map[slug] = await countVotesForUserInCategory(user.id, slug, programYear);
      }
      return map;
    },
  });

  const displayName = useMemo(() => {
    if (landingQuery.data?.kind !== "ok") return "";
    return landingQuery.data.anchor.podcaster_name || "Nominee";
  }, [landingQuery.data]);

  const showName = useMemo(() => {
    if (landingQuery.data?.kind !== "ok") return "";
    const d = landingQuery.data;
    return d.podcast?.title || d.anchor.podcast_name;
  }, [landingQuery.data]);

  const votingOpen = (p: NomRow["award_categories"]["award_programs"]) => {
    if (!p?.voting_open_at) return true;
    return new Date(p.voting_open_at) <= new Date();
  };

  const handleVote = async (n: NomRow) => {
    if (!user) {
      const returnTo = encodeURIComponent(`/vote/${nominationId}`);
      navigate(`/auth?mode=signup&intent=voter&returnTo=${returnTo}`);
      return;
    }
    const prog = n.award_categories.award_programs;
    if (!votingOpen(prog)) {
      toast.error("Voting is not open for this program yet.");
      return;
    }
    const slug = n.award_categories.slug;
    const year = prog.year;
    setVoteBusy(n.category_id);
    try {
      const used = votesUsedByCategory.data?.[slug] ?? 0;
      if (used >= 3) {
        toast.error("You have already used all 3 votes in this category.");
        return;
      }
      const slot = await getNextVoteSlot(user.id, slug, year);
      if (slot === null) {
        toast.error("You have already used all 3 votes in this category.");
        return;
      }
      const { error } = await supabase.from("votes").insert({
        user_id: user.id,
        category_id: slug,
        nominee_id: n.podcast_id,
        year,
        vote_slot: slot,
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("Vote slot conflict — try again.");
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success("Your vote has been cast!");
      const r = await rankAmongNominees(n.podcast_id, n.category_id, slug, year);
      setJustVoted((prev) => ({
        ...prev,
        [n.category_id]: { rank: r.rank, categoryName: n.award_categories.name },
      }));
      await votesUsedByCategory.refetch();
    } finally {
      setVoteBusy(null);
    }
  };

  if (!nominationId) {
    return null;
  }

  if (!isUuid) {
    if (legacyRedirecting) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="font-serif text-2xl font-bold mb-2">Voting page not found</h1>
          <p className="text-muted-foreground mb-6">
            This link may be invalid or the nominee has not set up nominations yet.
          </p>
          <Button asChild variant="gold">
            <Link to="/categories">Browse categories</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (landingQuery.isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (landingQuery.data?.kind === "not_found") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="font-serif text-2xl font-bold mb-2">Nomination not found</h1>
          <Button asChild className="mt-4" variant="goldOutline">
            <Link to="/categories">Browse all categories</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const data = landingQuery.data;
  if (data?.kind !== "ok") return null;

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/vote/${nominationId}`;
  const img = data.podcast?.image_url;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Vote for ${displayName} — Veteran Podcast Awards`}
        description={`Support ${displayName} on ${showName} in the Veteran Podcast Awards.`}
        canonicalUrl={`/vote/${nominationId}`}
      />
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-lg md:max-w-2xl">
        <Card className="overflow-hidden border-primary/20 mb-8">
          <CardHeader className="text-center space-y-4 pb-2">
            <Avatar className="w-24 h-24 mx-auto border-4 border-primary/30">
              <AvatarImage src={img || undefined} alt={showName} />
              <AvatarFallback className="text-2xl bg-secondary">{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-serif text-2xl">{displayName}</CardTitle>
              <CardDescription className="text-base text-foreground/90 font-medium">{showName}</CardDescription>
            </div>
            {data.podcast?.description && (
              <p className="text-sm text-muted-foreground text-left leading-relaxed line-clamp-6">
                {data.podcast.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Share2 className="w-3 h-3" />
              Share this page to collect votes
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success("Link copied");
              }}
            >
              Copy voting link
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4 mb-8">
          <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Nominated categories
          </h2>
          {data.nominations.map((n) => {
            const prog = n.award_categories.award_programs;
            const open = votingOpen(prog);
            const used = votesUsedByCategory.data?.[n.award_categories.slug] ?? 0;
            const votedInfo = justVoted[n.category_id];
            return (
              <Card key={n.id} className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-serif">{n.award_categories.name}</CardTitle>
                  <CardDescription>
                    {open ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Voting open</span>
                    ) : (
                      <span>Voting opens {prog.voting_open_at ? new Date(prog.voting_open_at).toLocaleString() : "soon"}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full min-h-12 text-base"
                    variant="gold"
                    disabled={!open || voteBusy === n.category_id || used >= 3}
                    onClick={() => handleVote(n)}
                  >
                    {voteBusy === n.category_id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : used >= 3 ? (
                      "You used all 3 votes here"
                    ) : (
                      `Vote for ${displayName} in ${n.award_categories.name}`
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {used}/3 votes used in this category (max 3 per voter)
                  </p>
                  {votedInfo && (
                    <p className="text-sm text-center font-medium text-primary">
                      They are currently ranked #{votedInfo.rank} in {votedInfo.categoryName}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button variant="goldOutline" className="w-full min-h-12" asChild>
          <Link to="/categories">
            Browse all categories
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default VotePage;

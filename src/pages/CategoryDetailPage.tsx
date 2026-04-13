import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Mic } from "lucide-react";

type Program = { id: string; year: number; status: string; name: string };

const CategoryDetailPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  const categoryQuery = useQuery({
    queryKey: ["category-detail", categorySlug],
    enabled: Boolean(categorySlug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("award_categories")
        .select("id, slug, name, description, program_id, award_programs (id, year, status, name)")
        .eq("slug", categorySlug!);
      if (error) throw error;
      const rows = (data ?? []) as {
        id: string;
        slug: string;
        name: string;
        description: string | null;
        program_id: string;
        award_programs: Program | null;
      }[];
      const active = rows.find((r) => r.award_programs?.status === "active");
      return active ?? null;
    },
  });

  const nomineesQuery = useQuery({
    queryKey: ["category-nominees-public", categoryQuery.data?.id, categoryQuery.data?.slug],
    enabled: Boolean(categoryQuery.data?.id),
    refetchInterval: 20_000,
    queryFn: async () => {
      const cat = categoryQuery.data!;
      const year = cat.award_programs!.year;
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
        .eq("category_id", cat.id);
      if (error) throw error;
      const list = noms ?? [];
      const podIds = [...new Set(list.map((n) => n.podcast_id))];
      let counts: { podcast_id: string; vote_count: number }[] = [];
      if (podIds.length) {
        const { data: vc } = await supabase
          .from("vote_counts")
          .select("podcast_id, vote_count")
          .eq("category_id", cat.slug)
          .eq("year", year)
          .in("podcast_id", podIds);
        counts = vc ?? [];
      }
      const countMap = new Map(counts.map((c) => [c.podcast_id, c.vote_count]));
      const enriched = list.map((n) => ({
        ...n,
        votes: countMap.get(n.podcast_id) ?? 0,
        image_url: (n as { podcasts?: { image_url: string | null; title: string } | null }).podcasts?.image_url ?? null,
        title: (n as { podcasts?: { image_url: string | null; title: string } | null }).podcasts?.title ?? n.podcast_name,
      }));
      enriched.sort((a, b) => b.votes - a.votes);
      return enriched;
    },
  });

  if (!categorySlug) return null;

  if (categoryQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!categoryQuery.data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">Category not found</h1>
          <Button asChild variant="goldOutline">
            <Link to="/categories">Back to categories</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const cat = categoryQuery.data;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${cat.name} — Nominees`}
        description={`Browse nominees for ${cat.name} in the ${cat.award_programs?.name ?? "Veteran Podcast Awards"}.`}
        canonicalUrl={`/categories/${cat.slug}`}
      />
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <Button variant="ghost" className="mb-6 -ml-2 gap-1" asChild>
          <Link to="/categories">
            <ChevronLeft className="w-4 h-4" />
            All categories
          </Link>
        </Button>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-gold-gradient">{cat.name}</h1>
        {cat.description && <p className="text-muted-foreground mb-8 max-w-2xl">{cat.description}</p>}

        {nomineesQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !nomineesQuery.data?.length ? (
          <p className="text-muted-foreground text-center py-12">No nominees in this category yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1">
            {nomineesQuery.data.map((n) => (
              <Link key={n.id} to={`/vote/${n.id}`} className="block">
                <Card className="h-full transition-colors hover:border-primary/50 active:scale-[0.99]">
                  <CardContent className="p-4 flex gap-4 items-center">
                    <div className="relative shrink-0">
                      <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-primary/20">
                        <AvatarImage src={n.image_url || undefined} alt={n.title} />
                        <AvatarFallback className="bg-secondary">
                          <Mic className="w-8 h-8 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif font-semibold text-lg truncate">{n.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{n.podcaster_name}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 font-mono tabular-nums text-sm px-3 py-1">
                      {n.votes} votes
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryDetailPage;

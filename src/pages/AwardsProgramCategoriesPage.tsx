import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, Trophy } from "lucide-react";
import { publicCategoryEmoji } from "@/lib/awards";

const AwardsProgramCategoriesPage = () => {
  const { programId } = useParams<{ programId: string }>();

  const programQuery = useQuery({
    queryKey: ["award-program-public", programId],
    enabled: Boolean(programId),
    queryFn: async () => {
      const { data, error } = await supabase.from("award_programs").select("*").eq("id", programId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["award-categories-public", programId],
    enabled: Boolean(programId) && Boolean(programQuery.data),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("award_categories")
        .select("id, slug, name, description, sort_order")
        .eq("program_id", programId!)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const countsQuery = useQuery({
    queryKey: ["award-category-nominee-counts", programId],
    enabled: Boolean(programId) && Boolean(categoriesQuery.data?.length),
    queryFn: async () => {
      const cats = categoriesQuery.data!;
      const ids = cats.map((c) => c.id);
      const { data, error } = await supabase.from("nominations").select("category_id").in("category_id", ids);
      if (error) throw error;
      const map: Record<string, number> = {};
      for (const row of data ?? []) {
        const cid = row.category_id as string;
        map[cid] = (map[cid] ?? 0) + 1;
      }
      return map;
    },
  });

  const p = programQuery.data;
  const accent = p?.primary_color?.trim() || "#B8860B";

  if (!programId) return null;

  if (programQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="font-serif text-2xl font-bold">Program not found</h1>
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
        title={`${p.name} — Categories`}
        description={p.tagline ?? `Browse categories for ${p.name}.`}
        canonicalUrl={`/awards/${programId}/categories`}
      />
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <Button variant="ghost" className="mb-6 gap-1" asChild>
          <Link to="/awards">
            <ChevronLeft className="h-4 w-4" />
            All programs
          </Link>
        </Button>

        <div
          className="mb-10 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8"
          style={{ borderLeftWidth: 4, borderLeftColor: accent }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              {p.logo_url ? (
                <img src={p.logo_url} alt="" className="h-16 w-auto max-w-[180px] object-contain" />
              ) : (
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl"
                  style={{ backgroundColor: `${accent}22`, color: accent }}
                >
                  <Trophy className="h-8 w-8" />
                </div>
              )}
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">{p.name}</h1>
                {p.organization_name && <p className="text-sm text-muted-foreground">{p.organization_name}</p>}
                {p.tagline && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{p.tagline}</p>}
              </div>
            </div>
          </div>
        </div>

        {categoriesQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(categoriesQuery.data ?? []).map((c) => {
              const n = countsQuery.data?.[c.id] ?? 0;
              return (
                <Card
                  key={c.id}
                  className="rounded-2xl border-border/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderTopColor: accent, borderTopWidth: 3 }}
                >
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="text-3xl">{publicCategoryEmoji(c.slug)}</div>
                    <h2 className="font-serif text-lg font-semibold leading-snug">{c.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium tabular-nums text-foreground">{n}</span> nominee{n === 1 ? "" : "s"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-auto w-full border-2 bg-transparent"
                      style={{ borderColor: accent, color: accent }}
                      asChild
                    >
                      <Link to={`/awards/${programId}/categories/${c.id}`}>
                        View Nominees
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AwardsProgramCategoriesPage;

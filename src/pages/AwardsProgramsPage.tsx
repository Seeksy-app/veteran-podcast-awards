import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Loader2, Ticket, Trophy } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ProgramRow = Database["public"]["Tables"]["award_programs"]["Row"];

function formatNomClose(iso: string | null | undefined): string {
  if (!iso) return "TBA";
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return "TBA";
  }
}

const AwardsProgramsPage = () => {
  const { data: programs, isLoading } = useQuery({
    queryKey: ["public-award-programs-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("award_programs")
        .select(
          "id, name, year, status, tagline, organization_name, logo_url, primary_color, nominations_open_at, ceremony_at",
        )
        .eq("status", "active")
        .order("year", { ascending: false })
        .order("name");
      if (error) throw error;
      return (data ?? []) as ProgramRow[];
    },
  });

  const { data: categoryCounts } = useQuery({
    queryKey: ["public-award-program-category-counts", programs?.map((p) => p.id).join(",")],
    enabled: Boolean(programs?.length),
    queryFn: async () => {
      const { data, error } = await supabase.from("award_categories").select("program_id");
      if (error) throw error;
      const map: Record<string, number> = {};
      for (const row of data ?? []) {
        const pid = row.program_id as string;
        map[pid] = (map[pid] ?? 0) + 1;
      }
      return map;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Awards Programs"
        description="Browse active award programs, categories, and nominees."
        canonicalUrl="/awards"
      />
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">Awards Programs</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Each program runs independently with its own categories, nominees, and voting.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : !programs?.length ? (
          <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No active award programs right now. Check back soon.
          </p>
        ) : (
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            {programs.map((p) => {
              const accent = p.primary_color?.trim() || "#B8860B";
              const nCats = categoryCounts?.[p.id] ?? 0;
              return (
                <Card
                  key={p.id}
                  className="overflow-hidden rounded-2xl border-border/80 shadow-md transition-shadow hover:shadow-lg"
                >
                  <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" className="h-16 w-auto max-w-[140px] object-contain" />
                      ) : (
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl"
                          style={{ backgroundColor: `${accent}18`, color: accent }}
                        >
                          <Trophy className="h-7 w-7" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h2 className="font-serif text-xl font-bold leading-snug text-foreground md:text-2xl">{p.name}</h2>
                        {p.organization_name && (
                          <p className="mt-0.5 text-sm text-muted-foreground">{p.organization_name}</p>
                        )}
                      </div>
                    </div>
                    {p.tagline && <p className="text-sm italic leading-relaxed text-muted-foreground">{p.tagline}</p>}
                    <p className="text-sm text-foreground/90">
                      <span className="font-semibold tabular-nums">{nCats}</span> Categories · Nominations open until{" "}
                      <span className="tabular-nums">{formatNomClose(p.nominations_open_at)}</span>
                    </p>
                    <div className="mt-auto flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <Button
                        className="w-full border-0 text-white shadow hover:opacity-90 sm:w-auto sm:flex-1"
                        style={{ backgroundColor: accent }}
                        asChild
                      >
                        <Link to={`/awards/${p.id}/categories`}>
                          View Categories
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full gap-2 sm:w-auto sm:flex-1" asChild>
                        <Link to={`/awards/${p.id}/tickets`}>
                          <Ticket className="h-4 w-4" />
                          Get Tickets
                        </Link>
                      </Button>
                    </div>
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

export default AwardsProgramsPage;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { rankAmongNominees } from "@/lib/awards";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Loader2 } from "lucide-react";

interface MyResultsSectionProps {
  userId: string;
  podcastId: string | null;
  onGoToCategories: () => void;
  onGoToPromotion: () => void;
}

type NomRow = {
  id: string;
  category_id: string;
  award_categories: {
    id: string;
    slug: string;
    name: string;
    program_id: string;
    award_programs: { year: number; status: string } | null;
  } | null;
};

/** Podcaster view: votes received per entered category, live-ish. */
export const MyResultsSection = ({ userId, podcastId, onGoToCategories, onGoToPromotion }: MyResultsSectionProps) => {
  const results = useQuery({
    queryKey: ["my-results", userId, podcastId],
    enabled: !!podcastId,
    refetchInterval: 45_000,
    queryFn: async () => {
      const { data: noms } = await supabase
        .from("nominations")
        .select("id, category_id, award_categories(id, slug, name, program_id, award_programs(year, status))")
        .eq("user_id", userId);
      const rows = (noms ?? []) as unknown as NomRow[];
      const out: { categoryName: string; rank: number; total: number; votes: number }[] = [];
      for (const n of rows) {
        const cat = n.award_categories;
        if (!cat) continue;
        try {
          const r = await rankAmongNominees(podcastId!, cat.id, cat.slug, cat.program_id);
          out.push({ categoryName: cat.name, rank: r.rank, total: r.totalNominees, votes: r.votes });
        } catch {
          out.push({ categoryName: cat.name, rank: 1, total: 1, votes: 0 });
        }
      }
      return out;
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">My Results</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Votes received in each category you're entered in · updates automatically
        </p>
      </div>

      {!podcastId || (!results.isLoading && (results.data?.length ?? 0) === 0) ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-sm">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-900">You're not entered in any categories yet</p>
          <p className="text-sm text-slate-500 mt-1">Pick your categories to start collecting votes.</p>
          <Button variant="gold" className="mt-4" onClick={onGoToCategories}>
            Choose My Categories
          </Button>
        </div>
      ) : results.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(results.data ?? []).map((r) => (
              <div key={r.categoryName} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" /> {r.categoryName}
                </p>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{r.votes}</p>
                    <p className="text-xs text-slate-400">votes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-amber-600">#{r.rank}</p>
                    <p className="text-xs text-slate-400">of {r.total} nominees</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl border border-amber-200 p-4 flex items-center gap-4">
            <TrendingUp className="w-6 h-6 text-amber-600 shrink-0" />
            <p className="text-sm text-slate-600 flex-1">
              Want more votes? Share your voting link — every share puts your show in front of new voters.
            </p>
            <Button variant="gold" size="sm" onClick={onGoToPromotion}>
              Promote
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

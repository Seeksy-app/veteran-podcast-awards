import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trophy, Loader2, Rss } from "lucide-react";

interface AwardCategory {
  id: string;
  name: string;
  slug: string;
}

interface MyCategoriesSectionProps {
  userId: string;
  podcastId: string | null;
  podcastName: string;
  podcasterName: string;
  selectedCategories: string[];
  onSaved: (categoryIds: string[]) => void;
  onGoToProfile: () => void;
}

const MAX_CATEGORIES = 5;

/**
 * Podcaster-facing category management. Saving syncs the public `nominations`
 * table, which powers category pages, nominee counts, vote links, and share cards.
 */
export const MyCategoriesSection = ({
  userId,
  podcastId,
  podcastName,
  podcasterName,
  selectedCategories,
  onSaved,
  onGoToProfile,
}: MyCategoriesSectionProps) => {
  const [categories, setCategories] = useState<AwardCategory[]>([]);
  const [selected, setSelected] = useState<string[]>(selectedCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("award_categories")
        .select("id, name, slug")
        .order("sort_order");
      setCategories((data as AwardCategory[]) || []);
      setIsLoading(false);
    })();
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_CATEGORIES) {
        toast.error(`You can enter up to ${MAX_CATEGORIES} categories`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    if (!podcastId) return;
    setIsSaving(true);
    try {
      // Persist the picks on the profile
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ selected_categories: selected })
        .eq("id", userId);
      if (profileErr) throw profileErr;

      // Sync public nominations: remove dropped categories, add new ones
      const { data: existing } = await supabase
        .from("nominations")
        .select("id, category_id")
        .eq("user_id", userId);
      const existingIds = (existing || []).map((n) => n.category_id);
      const toRemove = (existing || []).filter((n) => !selected.includes(n.category_id));
      const toAdd = selected.filter((id) => !existingIds.includes(id));

      if (toRemove.length) {
        await supabase.from("nominations").delete().in("id", toRemove.map((n) => n.id));
      }
      if (toAdd.length) {
        const { error: nomErr } = await supabase.from("nominations").insert(
          toAdd.map((category_id) => ({
            user_id: userId,
            podcast_id: podcastId,
            podcast_name: podcastName,
            podcaster_name: podcasterName,
            category_id,
          }))
        );
        if (nomErr) throw nomErr;
      }

      onSaved(selected);
      toast.success("Categories saved — you're officially in the running!");
    } catch (e) {
      toast.error(`Could not save categories: ${(e as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">My Award Categories</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Pick up to {MAX_CATEGORIES} categories to compete in for the 2026 Veteran Podcast Awards
        </p>
      </div>

      {!podcastId ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
          <Rss className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-900">Link your podcast first</p>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            To enter award categories, connect your podcast in your profile so voters know which show they're voting for.
          </p>
          <Button variant="gold" className="mt-4" onClick={onGoToProfile}>
            Go to Profile
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-600" /> Categories
              </p>
              <span className={`text-sm font-semibold ${selected.length >= MAX_CATEGORIES ? "text-amber-600" : "text-slate-400"}`}>
                {selected.length}/{MAX_CATEGORIES} selected
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {categories.map((c) => {
                const on = selected.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggle(c.id)}
                    className={`flex items-center gap-2.5 rounded-lg border-2 px-4 py-3 text-left text-sm transition-all ${
                      on
                        ? "border-amber-500 bg-amber-50 text-amber-800 font-medium"
                        : "border-slate-200 text-slate-600 hover:border-amber-300"
                    }`}
                  >
                    <Trophy className={`w-4 h-4 shrink-0 ${on ? "text-amber-600" : "text-slate-300"}`} />
                    <span className="min-w-0 truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="gold" size="lg" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Categories"}
            </Button>
            <p className="text-xs text-slate-400">
              Saving enters <strong>{podcastName || "your podcast"}</strong> into the selected categories and
              updates the public voting pages.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

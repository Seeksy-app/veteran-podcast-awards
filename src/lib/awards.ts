import { supabase } from "@/integrations/supabase/client";

/** Match UUID v4-ish nomination id in /vote/:id */
export const NOMINATION_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isNominationUuid(param: string | undefined): boolean {
  return Boolean(param && NOMINATION_ID_RE.test(param));
}

export async function getNextVoteSlot(
  userId: string,
  categorySlug: string,
  programId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("votes")
    .select("vote_slot")
    .eq("user_id", userId)
    .eq("category_id", categorySlug)
    .eq("program_id", programId);
  if (error) throw error;
  const used = new Set((data ?? []).map((r) => r.vote_slot));
  for (let s = 1; s <= 3; s++) {
    if (!used.has(s)) return s;
  }
  return null;
}

export async function countVotesForUserInCategory(
  userId: string,
  categorySlug: string,
  programId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("votes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("category_id", categorySlug)
    .eq("program_id", programId);
  if (error) throw error;
  return count ?? 0;
}

/** Rank among all nominees in the category (by vote total); 1 = highest votes. */
export async function rankAmongNominees(
  podcastId: string,
  categoryUuid: string,
  categorySlug: string,
  programId: string,
): Promise<{ rank: number; totalNominees: number; votes: number }> {
  const { data: noms, error: e1 } = await supabase
    .from("nominations")
    .select("podcast_id")
    .eq("category_id", categoryUuid);
  if (e1) throw e1;
  const ids = [...new Set((noms ?? []).map((n) => n.podcast_id))];
  if (ids.length === 0) {
    return { rank: 1, totalNominees: 1, votes: 0 };
  }

  const { data: counts, error: e2 } = await supabase
    .from("vote_counts")
    .select("podcast_id, vote_count")
    .eq("category_id", categorySlug)
    .eq("program_id", programId)
    .in("podcast_id", ids);
  if (e2) throw e2;

  const tally = new Map<string, number>();
  for (const id of ids) tally.set(id, 0);
  for (const row of counts ?? []) {
    tally.set(row.podcast_id, row.vote_count);
  }

  const mine = tally.get(podcastId) ?? 0;
  const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  const idx = sorted.findIndex(([id]) => id === podcastId);
  const rank = idx >= 0 ? idx + 1 : sorted.length;
  return { rank, totalNominees: ids.length, votes: mine };
}

/** Emoji for public category cards (VPA + MVA + custom). */
export function publicCategoryEmoji(slug: string): string {
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
    "best-military-news-podcast": "📰",
    "best-veteran-affairs-show": "🎖️",
    "best-military-history-series": "📜",
    "best-active-duty-perspective": "⭐",
    "best-gold-star-family-show": "💙",
    "best-military-comedy": "😂",
    "best-defense-security-show": "🛡️",
    "media-personality-of-the-year": "🎬",
    "best-overall-veteran-podcast": "🎖️",
    "best-army-veteran-podcast": "⭐",
    "best-navy-veteran-podcast": "⚓",
    "best-marine-corps-veteran-podcast": "🦅",
    "best-air-force-veteran-podcast": "✈️",
    "best-military-transition-podcast": "🌉",
  };
  return map[slug] ?? "✨";
}

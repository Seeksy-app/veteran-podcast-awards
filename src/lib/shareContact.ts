import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export type ContactShareSource = "follow" | "vote";

export async function shareContactWithPodcaster(
  user: User,
  podcastId: string,
  source: ContactShareSource
) {
  const email = user.email;
  if (!email) return;
  const name = (user.user_metadata?.full_name as string | undefined) || email;

  const { data: existing } = await supabase
    .from("podcast_supporter_contacts" as any)
    .select("sources")
    .eq("podcast_id", podcastId)
    .eq("user_id", user.id)
    .maybeSingle();

  const sources = Array.from(
    new Set([...(((existing as any)?.sources as string[]) || []), source])
  );

  await supabase.from("podcast_supporter_contacts" as any).upsert(
    { podcast_id: podcastId, user_id: user.id, name, email: email.toLowerCase(), sources },
    { onConflict: "podcast_id,user_id" }
  );
}

/**
 * Fires a one-time-per-podcast toast asking the supporter to share their
 * contact info with the podcaster. Silently no-ops on repeat visits.
 */
export function promptShareContact(opts: {
  user: User;
  podcastId: string;
  podcastName: string;
  source: ContactShareSource;
}) {
  const key = `vpa-contact-share-asked-${opts.podcastId}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, "1");

  toast(`Share your contact info with ${opts.podcastName}?`, {
    description: "They'll see your name and email as a supporter. You're opting in — nothing is shared otherwise.",
    duration: 10000,
    action: {
      label: "Share",
      onClick: () => {
        shareContactWithPodcaster(opts.user, opts.podcastId, opts.source)
          .then(() => toast.success(`Shared with ${opts.podcastName}!`))
          .catch(() => toast.error("Couldn't share your info — try again from your Favorites."));
      },
    },
  });
}

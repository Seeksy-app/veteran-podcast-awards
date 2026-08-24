import { supabase } from "@/integrations/supabase/client";

interface ContactListEntry {
  email: string;
  name: string;
  list: string;
  tag?: string;
  status?: string;
  source?: string;
  podcastName?: string | null;
  podcastUrl?: string | null;
  notes?: string | null;
}

/**
 * Add a contact to a list, merging with any existing contact record.
 * Unlike upsert with ignoreDuplicates, this preserves existing lists/tags
 * and appends the new ones (e.g. a Podcast Network contact who registers
 * also lands in Registered Users).
 */
export async function addToContactList(entry: ContactListEntry) {
  const email = entry.email.trim().toLowerCase();

  const { data: existing } = await supabase
    .from("podcast_contacts")
    .select("id, lists, tags, name, podcast_name, podcast_url, notes, status")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const lists = Array.from(new Set([...(existing.lists || []), entry.list]));
    const tags = entry.tag
      ? Array.from(new Set([...(existing.tags || []), entry.tag]))
      : existing.tags;
    await supabase
      .from("podcast_contacts")
      .update({
        lists,
        tags,
        name: existing.name || entry.name,
        status: entry.status || existing.status,
        podcast_name: existing.podcast_name || entry.podcastName || null,
        podcast_url: existing.podcast_url || entry.podcastUrl || null,
        notes: existing.notes || entry.notes || null,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("podcast_contacts").insert({
      email,
      name: entry.name,
      source: entry.source || "Website",
      status: entry.status || "uncontacted",
      lists: [entry.list],
      tags: entry.tag ? [entry.tag] : [],
      podcast_name: entry.podcastName || null,
      podcast_url: entry.podcastUrl || null,
      notes: entry.notes || null,
    });
  }
}

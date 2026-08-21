import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PODCHASER_BASE = "https://developers.podchaser.com/api/rest/v1";
const CACHE_TTL_HOURS = 48;
const FETCH_PER_PAGE = 25;
const SERVE_PER_PAGE = 15;

const MILITARY_KEYWORDS = [
  "veteran", "army", "marine", "navy", "coast guard",
  "space force", "air force", "military", "combat",
  "service member", "active duty", "national guard",
];

function isMilitaryRelevant(podcast: { title?: string; description?: string; categories?: { title?: string; slug?: string }[] }): boolean {
  const text = `${podcast.title || ""} ${podcast.description || ""}`.toLowerCase();
  if (MILITARY_KEYWORDS.some((kw) => text.includes(kw))) return true;
  if (podcast.categories?.some((c) =>
    /military|government/i.test(c.title || "") || /military|government/i.test(c.slug || "")
  )) return true;
  return false;
}

function supabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function podchaserFetch(path: string, params: Record<string, string>) {
  const apiKey = Deno.env.get("PODCHASER_API_KEY");
  if (!apiKey) throw new Error("PODCHASER_API_KEY not configured");

  const url = new URL(`${PODCHASER_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-api-key": apiKey,
      Accept: "application/json",
    },
  });

  if (res.status === 429) {
    throw new Error("Rate limit exceeded — try again later");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Podchaser API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function getCached(sb: ReturnType<typeof supabaseAdmin>, key: string) {
  const { data } = await sb
    .from("podchaser_cache")
    .select("response, fetched_at")
    .eq("cache_key", key)
    .single();

  if (!data) return null;

  const ageHours =
    (Date.now() - new Date(data.fetched_at).getTime()) / (1000 * 60 * 60);
  if (ageHours > CACHE_TTL_HOURS) return null;

  return data.response;
}

async function setCache(
  sb: ReturnType<typeof supabaseAdmin>,
  key: string,
  response: unknown
) {
  await sb.from("podchaser_cache").upsert(
    {
      cache_key: key,
      response,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "cache_key" }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, query, page, podcast_id } = body;
    const sb = supabaseAdmin();

    if (action === "top") {
      const requestedPage = Math.max(1, Math.min(Number(page) || 1, 3));
      const cacheKey = `top:military-veteran:${requestedPage}`;
      const cached = await getCached(sb, cacheKey);
      if (cached) {
        return new Response(JSON.stringify({ ...cached, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await podchaserFetch("/search/podcasts", {
        q: "veterans",
        page: String(requestedPage),
        per_page: String(FETCH_PER_PAGE),
        sort: "power_score",
        sort_direction: "desc",
        status: "active",
      });

      result.data = result.data.filter(isMilitaryRelevant).slice(0, SERVE_PER_PAGE);

      await setCache(sb, cacheKey, result);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "search") {
      if (!query || typeof query !== "string" || query.trim().length < 2) {
        return new Response(
          JSON.stringify({ error: "query must be at least 2 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cleanQuery = query.trim().toLowerCase().slice(0, 100);
      const requestedPage = Math.max(1, Math.min(Number(page) || 1, 3));
      const cacheKey = `search:${cleanQuery}:${requestedPage}`;
      const cached = await getCached(sb, cacheKey);
      if (cached) {
        return new Response(JSON.stringify({ ...cached, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await podchaserFetch("/search/podcasts", {
        q: cleanQuery,
        page: String(requestedPage),
        per_page: String(FETCH_PER_PAGE),
        sort: "power_score",
        sort_direction: "desc",
        status: "active",
      });

      result.data = result.data.filter(isMilitaryRelevant).slice(0, SERVE_PER_PAGE);

      await setCache(sb, cacheKey, result);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "podcast") {
      if (!podcast_id) {
        return new Response(
          JSON.stringify({ error: "podcast_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cacheKey = `podcast:${podcast_id}`;
      const cached = await getCached(sb, cacheKey);
      if (cached) {
        return new Response(JSON.stringify({ ...cached, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await podchaserFetch(`/podcasts/${podcast_id}`, {});
      await setCache(sb, cacheKey, result);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: search, top, podcast" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Podchaser proxy error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

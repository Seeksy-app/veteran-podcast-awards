import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PODCHASER_BASE = "https://developers.podchaser.com/api/rest/v1";
const CACHE_TTL_HOURS = 24;

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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Podchaser API ${res.status}: ${text}`);
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

  const age =
    (Date.now() - new Date(data.fetched_at).getTime()) / (1000 * 60 * 60);
  if (age > CACHE_TTL_HOURS) return null;

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
    const { action, query, page, per_page, sort, sort_direction, podcast_id } =
      await req.json();

    const sb = supabaseAdmin();

    if (action === "search") {
      if (!query) {
        return new Response(
          JSON.stringify({ error: "query is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cacheKey = `search:${query}:${page || 1}:${sort || "relevance"}:${sort_direction || "desc"}`;
      const cached = await getCached(sb, cacheKey);
      if (cached) {
        return new Response(JSON.stringify({ ...cached, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await podchaserFetch("/search/podcasts", {
        q: query,
        page: String(page || 1),
        per_page: String(per_page || 25),
        sort: sort || "relevance",
        sort_direction: sort_direction || "desc",
        status: "active",
      });

      await setCache(sb, cacheKey, result);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "top") {
      const cacheKey = `top:military-veteran:${page || 1}`;
      const cached = await getCached(sb, cacheKey);
      if (cached) {
        return new Response(JSON.stringify({ ...cached, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await podchaserFetch("/search/podcasts", {
        q: "military veteran",
        page: String(page || 1),
        per_page: String(per_page || 25),
        sort: "power_score",
        sort_direction: "desc",
        status: "active",
      });

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

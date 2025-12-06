import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parse } from "https://deno.land/x/xml@2.1.3/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Episode {
  title: string;
  description: string;
  pubDate: string;
  duration: string;
  audioUrl: string;
  imageUrl?: string;
}

interface PodcastData {
  title: string;
  description: string;
  imageUrl: string;
  websiteUrl: string;
  author: string;
  episodes: Episode[];
}

function getNodeText(node: unknown): string {
  if (!node) return "";
  if (typeof node === "string") return node.trim();
  if (typeof node === "object" && node !== null) {
    // Handle text content
    if ("#text" in node) return String((node as Record<string, unknown>)["#text"]).trim();
    if ("$" in node) return String((node as Record<string, unknown>)["$"]).trim();
    // Try to get nested text
    const obj = node as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (key !== "@" && typeof obj[key] === "string") {
        return String(obj[key]).trim();
      }
    }
  }
  return "";
}

function getAttr(node: unknown, attrName: string): string {
  if (!node || typeof node !== "object") return "";
  const obj = node as Record<string, unknown>;
  if ("@" in obj && typeof obj["@"] === "object" && obj["@"] !== null) {
    const attrs = obj["@"] as Record<string, unknown>;
    return String(attrs[attrName] || "");
  }
  // Also check direct attribute
  if (`@${attrName}` in obj) {
    return String(obj[`@${attrName}`] || "");
  }
  return "";
}

function findNode(parent: unknown, ...names: string[]): unknown {
  if (!parent || typeof parent !== "object") return null;
  const obj = parent as Record<string, unknown>;
  for (const name of names) {
    if (name in obj) return obj[name];
    // Try with namespace variations
    const colonIndex = name.indexOf(":");
    if (colonIndex > -1) {
      const localName = name.substring(colonIndex + 1);
      if (localName in obj) return obj[localName];
    }
  }
  return null;
}

function parseRSSFeed(xmlText: string): PodcastData {
  const doc = parse(xmlText) as Record<string, unknown>;
  
  if (!doc) {
    throw new Error("Failed to parse XML");
  }
  
  // Navigate to channel
  const rss = doc.rss as Record<string, unknown> | undefined;
  const feed = doc.feed as Record<string, unknown> | undefined;
  
  let channel: Record<string, unknown> | undefined;
  
  if (rss && typeof rss === "object") {
    channel = rss.channel as Record<string, unknown>;
  } else if (feed) {
    // Atom feed
    channel = feed;
  }
  
  if (!channel) {
    throw new Error("Invalid RSS feed: no channel found");
  }

  // Get podcast info
  const title = getNodeText(channel.title);
  const description = getNodeText(findNode(channel, "description", "itunes:summary", "summary")) || "";
  const author = getNodeText(findNode(channel, "itunes:author", "author", "dc:creator")) || "";
  const websiteUrl = getNodeText(channel.link) || getAttr(channel.link, "href") || "";
  
  // Get image - try multiple sources
  let imageUrl = "";
  const itunesImage = findNode(channel, "itunes:image", "image");
  if (itunesImage) {
    imageUrl = getAttr(itunesImage, "href") || "";
    if (!imageUrl && typeof itunesImage === "object") {
      const imgObj = itunesImage as Record<string, unknown>;
      imageUrl = getNodeText(imgObj.url) || "";
    }
  }

  // Parse episodes (limit to 20 most recent)
  let items = channel.item as unknown[];
  if (!items) {
    items = channel.entry as unknown[] || []; // Atom feeds use "entry"
  }
  if (!Array.isArray(items)) {
    items = items ? [items] : [];
  }
  
  const episodes: Episode[] = [];
  
  for (let i = 0; i < Math.min(items.length, 20); i++) {
    const item = items[i] as Record<string, unknown>;
    if (!item) continue;
    
    const enclosure = item.enclosure as Record<string, unknown>;
    const audioUrl = getAttr(enclosure, "url") || "";
    
    // Get episode image if available
    const episodeImage = findNode(item, "itunes:image");
    const episodeImageUrl = getAttr(episodeImage, "href") || imageUrl;
    
    // Clean up description - strip HTML tags
    let desc = getNodeText(findNode(item, "description", "itunes:summary", "summary", "content")) || "";
    desc = desc.replace(/<[^>]*>/g, "").substring(0, 500);
    
    episodes.push({
      title: getNodeText(item.title),
      description: desc,
      pubDate: getNodeText(findNode(item, "pubDate", "published", "updated")),
      duration: getNodeText(findNode(item, "itunes:duration")),
      audioUrl,
      imageUrl: episodeImageUrl,
    });
  }

  return {
    title,
    description: description.replace(/<[^>]*>/g, "").substring(0, 1000),
    imageUrl,
    websiteUrl,
    author,
    episodes,
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rssUrl, podcastId } = await req.json();
    
    if (!rssUrl) {
      return new Response(
        JSON.stringify({ error: "RSS URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching RSS feed:", rssUrl);
    
    // Fetch the RSS feed
    const rssResponse = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VeteranPodcastAwards/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    
    if (!rssResponse.ok) {
      throw new Error(`Failed to fetch RSS feed: ${rssResponse.status}`);
    }
    
    const rssText = await rssResponse.text();
    const podcastData = parseRSSFeed(rssText);
    
    console.log("Parsed podcast:", podcastData.title, "with", podcastData.episodes.length, "episodes");
    
    // If podcastId is provided, update the database
    if (podcastId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error: updateError } = await supabase
        .from("podcasts")
        .update({
          title: podcastData.title,
          description: podcastData.description,
          image_url: podcastData.imageUrl,
          website_url: podcastData.websiteUrl,
          author: podcastData.author,
          episodes: podcastData.episodes,
          last_fetched_at: new Date().toISOString(),
        })
        .eq("id", podcastId);
        
      if (updateError) {
        console.error("Error updating podcast:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: podcastData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error parsing RSS:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

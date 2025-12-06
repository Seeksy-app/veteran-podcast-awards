import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser, Element as XMLElement } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

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

function getTextContent(element: XMLElement | null, tagName: string): string {
  if (!element) return "";
  const el = element.querySelector(tagName);
  return el?.textContent?.trim() || "";
}

function parseRSSFeed(xml: string): PodcastData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  
  if (!doc) {
    throw new Error("Failed to parse XML");
  }
  
  const channel = doc.querySelector("channel");
  
  if (!channel) {
    throw new Error("Invalid RSS feed: no channel found");
  }

  // Get podcast info
  const title = getTextContent(channel as XMLElement, "title");
  const description = getTextContent(channel as XMLElement, "description") || 
                     getTextContent(channel as XMLElement, "itunes\\:summary");
  const author = getTextContent(channel as XMLElement, "itunes\\:author") || 
                getTextContent(channel as XMLElement, "author");
  const websiteUrl = getTextContent(channel as XMLElement, "link");
  
  // Get image - try multiple sources
  let imageUrl = "";
  const itunesImage = channel.querySelector("itunes\\:image");
  if (itunesImage) {
    imageUrl = itunesImage.getAttribute("href") || "";
  }
  if (!imageUrl) {
    const imageEl = channel.querySelector("image");
    if (imageEl) {
      imageUrl = getTextContent(imageEl as XMLElement, "url");
    }
  }

  // Parse episodes (limit to 20 most recent)
  const items = channel.querySelectorAll("item");
  const episodes: Episode[] = [];
  
  for (let i = 0; i < Math.min(items.length, 20); i++) {
    const item = items[i] as XMLElement;
    
    const enclosure = item.querySelector("enclosure");
    const audioUrl = enclosure?.getAttribute("url") || "";
    
    // Get episode image if available
    const episodeImage = item.querySelector("itunes\\:image");
    const episodeImageUrl = episodeImage?.getAttribute("href") || imageUrl;
    
    // Clean up description - strip HTML tags
    let desc = getTextContent(item, "description") || getTextContent(item, "itunes\\:summary");
    desc = desc.replace(/<[^>]*>/g, "").substring(0, 500);
    
    episodes.push({
      title: getTextContent(item, "title"),
      description: desc,
      pubDate: getTextContent(item, "pubDate"),
      duration: getTextContent(item, "itunes\\:duration"),
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
        "Accept": "application/rss+xml, application/xml, text/xml",
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

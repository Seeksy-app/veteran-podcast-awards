import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const UPLOAD_POST_API = "https://api.upload-post.com/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PostRequest {
  title: string;
  platforms: string[];
  scheduledDate?: string;
  timezone?: string;
  user?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("UPLOAD_POST_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Upload Post API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { title, platforms, scheduledDate, timezone, user }: PostRequest =
      await req.json();

    if (!title || !platforms?.length) {
      return new Response(
        JSON.stringify({ error: "title and platforms[] are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("user", user || "vpa-default");
    for (const p of platforms) {
      formData.append("platform[]", p);
    }
    if (scheduledDate) {
      formData.append("scheduled_date", scheduledDate);
    }
    if (timezone) {
      formData.append("timezone", timezone);
    }

    console.log(`Posting to ${platforms.join(", ")}: "${title.slice(0, 80)}..."`);

    const response = await fetch(`${UPLOAD_POST_API}/upload_text`, {
      method: "POST",
      headers: { Authorization: `Apikey ${apiKey}` },
      body: formData,
    });

    const result = await response.json();
    console.log("Upload Post response:", JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Social post error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

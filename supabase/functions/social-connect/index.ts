import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const UPLOAD_POST_API = "https://api.upload-post.com/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConnectRequest {
  action: "create-user" | "get-user" | "generate-connect-url";
  username: string;
  platforms?: string[];
  redirectUrl?: string;
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

  const authHeaders = {
    Authorization: `Apikey ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    const { action, username, platforms, redirectUrl }: ConnectRequest = await req.json();

    if (!username) {
      return new Response(
        JSON.stringify({ error: "username is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create-user") {
      const res = await fetch(`${UPLOAD_POST_API}/uploadposts/users`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ username }),
      });
      const data = await res.json();

      if (res.status === 409) {
        return new Response(
          JSON.stringify({ success: true, exists: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-user") {
      const res = await fetch(`${UPLOAD_POST_API}/uploadposts/users/${username}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate-connect-url") {
      const body: Record<string, unknown> = {
        username,
        connect_title: "Connect Your Social Accounts",
        connect_description: "Link your social media to share your Veteran Podcast Awards nomination with your audience.",
        logo_image: "https://veteranpodcastawards.com/vpa-logo.png",
        redirect_url: redirectUrl || "https://veteranpodcastawards.com/dashboard",
        show_calendar: false,
      };

      if (platforms?.length) {
        body.platforms = platforms;
      }

      const res = await fetch(`${UPLOAD_POST_API}/uploadposts/users/generate-jwt`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: create-user, get-user, generate-connect-url" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Social connect error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

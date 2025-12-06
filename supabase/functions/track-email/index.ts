import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent PNG pixel
const TRACKING_PIXEL = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sendId = url.searchParams.get("id");
    const type = url.searchParams.get("type"); // "open" or "click"
    const redirectUrl = url.searchParams.get("url");

    if (!sendId) {
      console.error("Missing send ID");
      return new Response("Missing ID", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (type === "open") {
      // Track email open
      const { error } = await supabase
        .from("email_sends")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", sendId)
        .is("opened_at", null); // Only update if not already opened

      if (error) {
        console.error("Error tracking open:", error);
      } else {
        console.log(`Tracked open for send ${sendId}`);
        
        // Update campaign opened_count
        const { data: send } = await supabase
          .from("email_sends")
          .select("campaign_id")
          .eq("id", sendId)
          .single();
        
        if (send?.campaign_id) {
          await supabase.rpc("increment_campaign_opened", { campaign_id: send.campaign_id });
        }
      }

      // Return tracking pixel
      return new Response(TRACKING_PIXEL, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    } else if (type === "click" && redirectUrl) {
      // Track email click
      const { error } = await supabase
        .from("email_sends")
        .update({ clicked_at: new Date().toISOString() })
        .eq("id", sendId);

      if (error) {
        console.error("Error tracking click:", error);
      } else {
        console.log(`Tracked click for send ${sendId}`);
        
        // Update campaign clicked_count
        const { data: send } = await supabase
          .from("email_sends")
          .select("campaign_id")
          .eq("id", sendId)
          .single();
        
        if (send?.campaign_id) {
          await supabase.rpc("increment_campaign_clicked", { campaign_id: send.campaign_id });
        }
      }

      // Redirect to original URL
      return new Response(null, {
        status: 302,
        headers: {
          Location: decodeURIComponent(redirectUrl),
        },
      });
    }

    return new Response("Invalid request", { status: 400 });
  } catch (error: any) {
    console.error("Error in track-email function:", error);
    return new Response(error.message, { status: 500 });
  }
};

serve(handler);

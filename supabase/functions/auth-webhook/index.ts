import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { type, record } = payload;

    if (type === "UPDATE" && record?.email_confirmed_at && record?.raw_user_meta_data) {
      const meta = record.raw_user_meta_data;
      const email = record.email;
      const name = meta.full_name || meta.name || email?.split("@")[0] || "there";
      const userType = meta.user_type || "fan";

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Delay 5 minutes before sending the welcome email from Riccoh
      const delayMs = 5 * 60 * 1000;
      setTimeout(async () => {
        try {
          await supabase.functions.invoke("send-welcome-email", {
            body: { type: userType, email, name },
          });
          console.log(`Welcome email sent to ${email} after 5min delay`);
        } catch (err) {
          console.error("Failed to send delayed welcome email:", err);
        }
      }, delayMs);

      console.log(`Email confirmed for ${email}, welcome email scheduled in 5 minutes`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Auth webhook error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

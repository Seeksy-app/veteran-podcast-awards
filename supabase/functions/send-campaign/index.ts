import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  campaignId: string;
  subject: string;
  content: string;
  targetList: string;
  fromName?: string;
  fromEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { campaignId, subject, content, targetList, fromName = "Veteran Podcast Awards", fromEmail = "onboarding@resend.dev" }: CampaignRequest = await req.json();

    console.log(`Starting campaign ${campaignId} to list: ${targetList}`);

    // Get contacts for the target list
    const { data: contacts, error: contactsError } = await supabase
      .from("podcast_contacts")
      .select("id, email, name, host_name, podcast_name")
      .contains("lists", [targetList]);

    if (contactsError) {
      console.error("Error fetching contacts:", contactsError);
      throw new Error("Failed to fetch contacts");
    }

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No contacts found for this list" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${contacts.length} contacts for list ${targetList}`);

    let successCount = 0;
    let failCount = 0;
    const sendResults: Array<{ email: string; resendId?: string; error?: string }> = [];

    for (const contact of contacts) {
      try {
        // Personalize content
        const personalizedContent = content
          .replace(/{{name}}/g, contact.host_name || contact.name || "Friend")
          .replace(/{{podcast_name}}/g, contact.podcast_name || "your podcast")
          .replace(/{{email}}/g, contact.email);

        const personalizedSubject = subject.replace(/{{name}}/g, contact.host_name || contact.name || "Friend");

        // Send via Resend REST API
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${fromName} <${fromEmail}>`,
            to: [contact.email],
            subject: personalizedSubject,
            html: personalizedContent,
          }),
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
          throw new Error(resendData.message || "Failed to send email");
        }

        // Log the send
        await supabase.from("email_sends").insert({
          campaign_id: campaignId,
          contact_id: contact.id,
          email: contact.email,
          resend_id: resendData.id || null,
          status: "sent",
        });

        sendResults.push({ email: contact.email, resendId: resendData.id });
        successCount++;
        console.log(`Email sent to ${contact.email}`);
      } catch (error: any) {
        console.error(`Failed to send to ${contact.email}:`, error.message);
        sendResults.push({ email: contact.email, error: error.message });
        failCount++;

        // Log failed send
        await supabase.from("email_sends").insert({
          campaign_id: campaignId,
          contact_id: contact.id,
          email: contact.email,
          status: "failed",
        });
      }
    }

    // Update campaign stats
    await supabase
      .from("email_campaigns")
      .update({
        sent_count: successCount,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    console.log(`Campaign complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        results: sendResults,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-campaign function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);

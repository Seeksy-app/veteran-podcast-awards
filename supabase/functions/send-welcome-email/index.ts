import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type EmailType = "podcaster" | "fan" | "sponsorship" | "nomination";

interface WelcomeRequest {
  type: EmailType;
  email: string;
  name: string;
  podcastName?: string;
}

const LOGO_URL = "https://veteranpodcastawards.com/vpa-logo.png";

const SIGNATURE = `
  <table cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid #ddd;padding-top:20px;">
    <tr>
      <td style="vertical-align:top;padding-right:16px;">
        <img src="${LOGO_URL}" alt="VPA" width="60" style="border-radius:8px;" />
      </td>
      <td style="vertical-align:top;">
        <p style="margin:0;font-weight:bold;color:#1a1a1a;">Riccoh Player</p>
        <p style="margin:2px 0 0;font-size:13px;color:#666;">CEO &amp; Founder, Veteran Podcast Awards</p>
        <p style="margin:2px 0 0;font-size:13px;color:#666;">Retired USMC Officer &bull; Emmy Award Winner</p>
        <p style="margin:8px 0 0;font-size:13px;font-style:italic;color:#B8860B;">S/Fidelis</p>
      </td>
    </tr>
  </table>
`;

function getContent(type: EmailType, name: string, podcastName?: string) {
  const firstName = name.split(" ")[0] || name;

  switch (type) {
    case "podcaster":
      return {
        subject: "Welcome to the Veteran Podcast Awards Network",
        body: `
          <p>Hi ${firstName},</p>
          <p>Welcome to the Veteran &amp; Military Podcast Network — we're glad to have you${podcastName ? ` and <strong>${podcastName}</strong>` : ""} on board.</p>
          <p>Your podcast is now part of a growing community of over 4,987 military and veteran shows. As a registered podcaster, you'll be eligible for nominations and voting in the 2026 Veteran Podcast Awards.</p>
          <p>Log in to your <a href="https://veteranpodcastawards.com/dashboard" style="color:#B8860B;font-weight:bold;">dashboard</a> to complete your profile and explore the network.</p>
        `,
      };

    case "fan":
      return {
        subject: "Welcome to the Veteran Podcast Awards",
        body: `
          <p>Hi ${firstName},</p>
          <p>Thanks for joining the Veteran Podcast Awards community. Your voice matters — fans like you help recognize the podcasters who serve and inspire the military and veteran community.</p>
          <p>You can now nominate your favorite shows and vote when the 2026 awards season opens. Start exploring the <a href="https://veteranpodcastawards.com/network" style="color:#B8860B;font-weight:bold;">Podcast Network</a> to discover new voices.</p>
        `,
      };

    case "sponsorship":
      return {
        subject: "We Received Your Sponsorship Inquiry — Veteran Podcast Awards",
        body: `
          <p>Hi ${firstName},</p>
          <p>Thank you for your interest in sponsoring the Veteran Podcast Awards. We've received your inquiry and our team will be in touch shortly to discuss partnership opportunities.</p>
          <p>In the meantime, you can learn more about our <a href="https://veteranpodcastawards.com/sponsors" style="color:#B8860B;font-weight:bold;">sponsorship tiers and benefits</a>.</p>
        `,
      };

    case "nomination":
      return {
        subject: "Your Nomination Has Been Received — Veteran Podcast Awards",
        body: `
          <p>Hi ${firstName},</p>
          <p>Thank you for nominating ${podcastName ? `<strong>${podcastName}</strong>` : "a podcast"} for the Veteran Podcast Awards. Every nomination helps shine a light on the voices that matter in our military and veteran community.</p>
          <p>We'll let you know when voting opens. In the meantime, explore the <a href="https://veteranpodcastawards.com/network" style="color:#B8860B;font-weight:bold;">Podcast Network</a> and discover more great shows.</p>
        `,
      };
  }
}

function buildHtml(body: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
      .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #B8860B, #DAA520); padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #ffffff; padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
      .content p { margin: 0 0 14px; }
      .content a { color: #B8860B; text-decoration: none; }
      .content a:hover { text-decoration: underline; }
      .footer { text-align: center; padding: 16px; font-size: 11px; color: #999; }
      .footer a { color: #999; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <img src="${LOGO_URL}" alt="Veteran Podcast Awards" width="160" style="display:block;margin:0 auto;" />
      </div>
      <div class="content">
        ${body}
        ${SIGNATURE}
      </div>
      <div class="footer">
        <p>&copy; 2026 Veteran Podcast Awards &bull; National Military Podcast Day</p>
        <p><a href="https://veteranpodcastawards.com/privacy">Privacy</a> &bull; <a href="https://veteranpodcastawards.com/terms">Terms</a></p>
      </div>
    </div>
  </body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, name, podcastName }: WelcomeRequest = await req.json();

    if (!type || !email || !name) {
      return new Response(
        JSON.stringify({ error: "type, email, and name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const content = getContent(type, name, podcastName);
    if (!content) {
      return new Response(
        JSON.stringify({ error: "Invalid email type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending ${type} welcome email to ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Veteran Podcast Awards <hello@veteranpodcastawards.com>",
      to: [email],
      subject: content.subject,
      html: buildHtml(content.body),
    });

    console.log("Welcome email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Welcome email error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

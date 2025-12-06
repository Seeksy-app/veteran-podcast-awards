import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  podcastName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      recipientEmail, 
      recipientName, 
      senderName, 
      senderEmail, 
      subject, 
      message,
      podcastName 
    }: ContactRequest = await req.json();

    console.log(`Sending contact notification to ${recipientEmail}`);

    if (!recipientEmail) {
      console.log("No recipient email provided, skipping email send");
      return new Response(
        JSON.stringify({ success: true, message: "No email to send to" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "Veteran Podcast Awards <hello@veteranpodcastawards.com>",
      to: [recipientEmail],
      reply_to: senderEmail,
      subject: `New message from ${senderName}: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #B8860B, #DAA520); padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
              .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #B8860B; }
              .sender-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 20px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Message Received</h1>
              </div>
              <div class="content">
                <p>Hi ${recipientName || 'there'},</p>
                <p>You've received a new message through your Veteran Podcast Awards profile${podcastName ? ` for <strong>${podcastName}</strong>` : ''}.</p>
                
                <div class="message-box">
                  <p><strong>Subject:</strong> ${subject}</p>
                  <p><strong>Message:</strong></p>
                  <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                
                <div class="sender-info">
                  <p><strong>From:</strong> ${senderName}</p>
                  <p><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
                </div>
                
                <p style="margin-top: 20px;">You can reply directly to this email to respond to ${senderName}.</p>
              </div>
              <div class="footer">
                <p>This message was sent via the Veteran Podcast Awards platform.</p>
                <p>You can view all your messages in your <a href="https://veteranpodcastawards.com/dashboard">dashboard</a>.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending contact email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

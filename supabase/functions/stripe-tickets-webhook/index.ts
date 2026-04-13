import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resendKey = Deno.env.get("RESEND_API_KEY");

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const siteUrl = (Deno.env.get("PUBLIC_SITE_URL") || "https://veteranpodcastawards.com").replace(/\/$/, "");

  if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Stripe or Supabase env");
    return new Response("Server misconfigured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failed", err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const purchaseId = session.metadata?.purchase_id;
  if (!purchaseId) {
    console.error("No purchase_id in session metadata");
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: existing } = await supabase
    .from("award_ticket_purchases")
    .select("id, status, stripe_event_id, total_amount_cents, line_items, buyer_email, buyer_name, qr_token, program_id")
    .eq("id", purchaseId)
    .maybeSingle();

  if (!existing) {
    console.error("Purchase not found", purchaseId);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  if (existing.stripe_event_id === event.id) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
  }

  if (existing.status === "completed") {
    return new Response(JSON.stringify({ received: true, already: true }), { status: 200 });
  }

  const amountTotal = session.amount_total ?? 0;
  if (amountTotal !== existing.total_amount_cents) {
    console.error("Amount mismatch", amountTotal, existing.total_amount_cents);
    return new Response(JSON.stringify({ error: "amount_mismatch" }), { status: 400 });
  }

  const { error: updErr } = await supabase
    .from("award_ticket_purchases")
    .update({
      status: "completed",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
      stripe_event_id: event.id,
    })
    .eq("id", purchaseId)
    .eq("status", "pending");

  if (updErr) {
    console.error(updErr);
    return new Response(JSON.stringify({ error: "update_failed" }), { status: 500 });
  }

  const lineRows = existing.line_items as { ticket_type_id: string; quantity: number; name?: string }[];
  for (const row of lineRows) {
    const { data: tt } = await supabase
      .from("award_ticket_types")
      .select("id, quantity_sold, quantity_total")
      .eq("id", row.ticket_type_id)
      .single();
    if (!tt) continue;
    const nextSold = (tt.quantity_sold as number) + row.quantity;
    await supabase
      .from("award_ticket_types")
      .update({ quantity_sold: nextSold, updated_at: new Date().toISOString() })
      .eq("id", row.ticket_type_id);
  }

  const { data: program } = await supabase
    .from("award_programs")
    .select("name, ceremony_at")
    .eq("id", existing.program_id as string)
    .maybeSingle();

  const ticketUrl = `${siteUrl}/ticket/${existing.qr_token}`;
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticketUrl)}`;

  if (resendKey && existing.buyer_email) {
    const resend = new Resend(resendKey);
    const ceremony = program?.ceremony_at
      ? new Date(program.ceremony_at as string).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "TBA";

    const linesHtml = lineRows
      .map((l) => `<li>${(l.name ?? "Ticket").replace(/</g, "")} × ${l.quantity}</li>`)
      .join("");

    try {
      await resend.emails.send({
        from: "Veteran Podcast Awards <hello@veteranpodcastawards.com>",
        to: [existing.buyer_email as string],
        subject: `Your tickets — ${program?.name ?? "Award ceremony"}`,
        html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
          <div style="max-width:560px;margin:0 auto;padding:24px">
            <h1 style="font-size:20px">You&apos;re in!</h1>
            <p>Hi ${(existing.buyer_name as string).replace(/</g, "")},</p>
            <p>Thanks for your purchase for <strong>${(program?.name ?? "our ceremony").replace(/</g, "")}</strong>.</p>
            <p><strong>Date:</strong> ${ceremony}</p>
            <ul>${linesHtml}</ul>
            <p style="margin-top:24px">Show this QR code at check-in:</p>
            <img src="${qrImg}" width="220" height="220" alt="Ticket QR" style="display:block;border:1px solid #ddd;border-radius:8px;padding:8px;background:#fff"/>
            <p style="margin-top:16px;font-size:14px"><a href="${ticketUrl}">Open your ticket online</a></p>
            <p style="font-size:12px;color:#666;margin-top:32px">If you didn&apos;t make this purchase, contact us immediately.</p>
          </div>
        </body></html>`,
      });
    } catch (e) {
      console.error("Resend error", e);
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

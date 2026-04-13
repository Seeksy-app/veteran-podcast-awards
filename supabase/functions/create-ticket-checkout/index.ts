import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type LineInput = { ticket_type_id: string; quantity: number };

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const siteUrl = (Deno.env.get("PUBLIC_SITE_URL") || "https://veteranpodcastawards.com").replace(/\/$/, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as {
      programId?: string;
      lines?: LineInput[];
      buyerName?: string;
      buyerEmail?: string;
    };

    const programId = body.programId?.trim();
    const buyerName = body.buyerName?.trim();
    const buyerEmail = body.buyerEmail?.trim()?.toLowerCase();
    const rawLines = Array.isArray(body.lines) ? body.lines : [];

    const merged = new Map<string, number>();
    for (const line of rawLines) {
      const tid = line.ticket_type_id?.trim();
      const q = Math.floor(Number(line.quantity));
      if (!tid || !q || q < 1) continue;
      merged.set(tid, (merged.get(tid) ?? 0) + q);
    }
    const lines: LineInput[] = [...merged.entries()].map(([ticket_type_id, quantity]) => ({
      ticket_type_id,
      quantity,
    }));

    if (!programId || !buyerName || !buyerEmail || lines.length === 0) {
      return new Response(JSON.stringify({ error: "Missing program, buyer, or ticket lines" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: program, error: pErr } = await supabase
      .from("award_programs")
      .select("id, name, status, external_ticket_url")
      .eq("id", programId)
      .maybeSingle();

    if (pErr || !program) {
      return new Response(JSON.stringify({ error: "Program not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (program.status !== "active") {
      return new Response(JSON.stringify({ error: "Ticketing is not available for this program" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!stripeKey) {
      return new Response(
        JSON.stringify({
          error: "stripe_not_configured",
          message: "Online checkout is not configured.",
          external_ticket_url: program.external_ticket_url ?? null,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const typeIds = [...new Set(lines.map((l) => l.ticket_type_id))];
    const { data: types, error: tErr } = await supabase
      .from("award_ticket_types")
      .select("id, name, price_cents, quantity_total, quantity_sold, program_id, is_active")
      .in("id", typeIds)
      .eq("program_id", programId);

    if (tErr || !types?.length) {
      return new Response(JSON.stringify({ error: "Invalid ticket selection" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typeMap = new Map(types.map((t) => [t.id as string, t]));
    const lineItemsJson: {
      ticket_type_id: string;
      name: string;
      quantity: number;
      unit_price_cents: number;
    }[] = [];
    let totalCents = 0;

    for (const line of lines) {
      const q = Math.floor(Number(line.quantity));
      if (!q || q < 1 || q > 50) {
        return new Response(JSON.stringify({ error: "Invalid quantity" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const tt = typeMap.get(line.ticket_type_id);
      if (!tt || !tt.is_active) {
        return new Response(JSON.stringify({ error: "Invalid ticket type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const cap = tt.quantity_total as number | null;
      const sold = (tt.quantity_sold as number) ?? 0;
      const avail = cap == null ? Infinity : cap - sold;
      if (avail < q) {
        return new Response(JSON.stringify({ error: `Not enough tickets left for ${tt.name}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const unit = tt.price_cents as number;
      totalCents += unit * q;
      lineItemsJson.push({
        ticket_type_id: tt.id as string,
        name: tt.name as string,
        quantity: q,
        unit_price_cents: unit,
      });
    }

    if (totalCents <= 0) {
      return new Response(JSON.stringify({ error: "Invalid total" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: purchase, error: insErr } = await supabase
      .from("award_ticket_purchases")
      .insert({
        program_id: programId,
        status: "pending",
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        line_items: lineItemsJson,
        total_amount_cents: totalCents,
      })
      .select("id, qr_token")
      .single();

    if (insErr || !purchase) {
      console.error(insErr);
      return new Response(JSON.stringify({ error: "Could not start checkout" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const stripeLineItems = lineItemsJson.map((row) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${program.name} — ${row.name}`,
        },
        unit_amount: row.unit_price_cents,
      },
      quantity: row.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: buyerEmail,
      metadata: {
        purchase_id: purchase.id as string,
        program_id: programId,
      },
      success_url: `${siteUrl}/awards/${programId}/tickets?checkout=success`,
      cancel_url: `${siteUrl}/awards/${programId}/tickets?checkout=cancelled`,
      line_items: stripeLineItems,
    });

    await supabase
      .from("award_ticket_purchases")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", purchase.id);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message || "Checkout failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

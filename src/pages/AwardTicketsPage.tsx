import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronLeft, ExternalLink, Ticket } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ProgramRow = Database["public"]["Tables"]["award_programs"]["Row"];
type TicketTypeRow = Database["public"]["Tables"]["award_ticket_types"]["Row"];

const AwardTicketsPage = () => {
  const { programId } = useParams<{ programId: string }>();
  const [searchParams] = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const programQuery = useQuery({
    queryKey: ["award-program-tickets", programId],
    enabled: Boolean(programId),
    queryFn: async () => {
      const { data, error } = await supabase.from("award_programs").select("*").eq("id", programId!).maybeSingle();
      if (error) throw error;
      return data as ProgramRow | null;
    },
  });

  const typesQuery = useQuery({
    queryKey: ["award-ticket-types-public", programId],
    enabled: Boolean(programId) && programQuery.data?.status === "active",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("award_ticket_types")
        .select("*")
        .eq("program_id", programId!)
        .eq("is_active", true)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return (data ?? []) as TicketTypeRow[];
    },
  });

  const p = programQuery.data;
  const accent = p?.primary_color?.trim() || "#B8860B";

  const lines = useMemo(() => {
    const out: { ticket_type_id: string; quantity: number }[] = [];
    for (const t of typesQuery.data ?? []) {
      const q = quantities[t.id] ?? 0;
      if (q > 0) out.push({ ticket_type_id: t.id, quantity: q });
    }
    return out;
  }, [typesQuery.data, quantities]);

  const subtotalCents = useMemo(() => {
    let s = 0;
    for (const t of typesQuery.data ?? []) {
      const q = quantities[t.id] ?? 0;
      s += t.price_cents * q;
    }
    return s;
  }, [typesQuery.data, quantities]);

  const handleCheckout = async () => {
    if (!programId || lines.length === 0) {
      toast.error("Select at least one ticket.");
      return;
    }
    if (!buyerName.trim() || !buyerEmail.trim()) {
      toast.error("Enter your name and email.");
      return;
    }
    setSubmitting(true);
    try {
      const base = import.meta.env.VITE_SUPABASE_URL as string;
      const key =
        (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
        (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined);
      const res = await fetch(`${base}/functions/v1/create-ticket-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          apikey: key ?? "",
        },
        body: JSON.stringify({
          programId,
          lines,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
        }),
      });
      const payload = (await res.json()) as {
        url?: string;
        error?: string;
        message?: string;
        external_ticket_url?: string | null;
      };
      if (payload.url) {
        window.location.href = payload.url;
        return;
      }
      if (payload.error === "stripe_not_configured" || res.status === 503) {
        toast.message("Online checkout is not configured", {
          description: p?.external_ticket_url
            ? "Use the external ticket link on this page."
            : payload.message ?? "Contact the organizer.",
        });
        return;
      }
      toast.error(payload.error ?? payload.message ?? "Could not start checkout");
    } finally {
      setSubmitting(false);
    }
  };

  if (!programId) return null;

  if (programQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!p || p.status !== "active") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="font-serif text-2xl font-bold">Tickets unavailable</h1>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/awards">Programs</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const hasStripePath = (typesQuery.data?.length ?? 0) > 0;
  const externalOnly = Boolean(p.external_ticket_url) && !hasStripePath;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Tickets — ${p.name}`}
        description={`Get tickets for ${p.name}.`}
        canonicalUrl={`/awards/${programId}/tickets`}
      />
      <Header />
      <main className="container mx-auto max-w-2xl px-4 pt-24 pb-16">
        <Button variant="ghost" className="mb-6 gap-1" asChild>
          <Link to="/awards">
            <ChevronLeft className="h-4 w-4" />
            Programs
          </Link>
        </Button>

        {checkoutStatus === "success" && (
          <div className="mb-8 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
            Payment received — check your email for your QR ticket.
          </div>
        )}
        {checkoutStatus === "cancelled" && (
          <div className="mb-8 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            Checkout was cancelled. You can try again below.
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-border/80 bg-card p-6 shadow-sm" style={{ borderLeftWidth: 4, borderLeftColor: accent }}>
          <div className="flex items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
              style={{ backgroundColor: `${accent}22`, color: accent }}
            >
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">{p.name}</h1>
              {p.ceremony_at && (
                <p className="text-sm text-muted-foreground">
                  Ceremony:{" "}
                  {format(new Date(p.ceremony_at.includes("T") ? p.ceremony_at : `${p.ceremony_at}T12:00:00`), "PPP")}
                </p>
              )}
            </div>
          </div>
        </div>

        {p.external_ticket_url && (
          <Card className="mb-8 rounded-2xl border-border/80">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">External tickets</p>
                <p className="text-xs text-muted-foreground">Eventbrite or another vendor</p>
              </div>
              <Button variant="outline" className="shrink-0 gap-2" asChild>
                <a href={p.external_ticket_url} target="_blank" rel="noopener noreferrer">
                  Open external tickets
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {externalOnly && (
          <p className="text-center text-sm text-muted-foreground">
            Online sales for this event are hosted externally. Use the button above.
          </p>
        )}

        {hasStripePath && (
          <>
            <h2 className="mb-4 font-serif text-lg font-semibold">Select tickets</h2>
            <div className="space-y-4">
              {(typesQuery.data ?? []).map((t) => {
                const cap = t.quantity_total;
                const sold = t.quantity_sold;
                const avail = cap == null ? Infinity : Math.max(0, cap - sold);
                const q = quantities[t.id] ?? 0;
                return (
                  <Card key={t.id} className="rounded-xl border-border/80">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                        <p className="mt-1 text-sm">
                          ${(t.price_cents / 100).toFixed(2)} each
                          {cap != null && (
                            <span className="text-muted-foreground"> · {avail} left</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={q <= 0}
                          onClick={() => setQuantities((prev) => ({ ...prev, [t.id]: Math.max(0, q - 1) }))}
                        >
                          −
                        </Button>
                        <span className="w-8 text-center tabular-nums">{q}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={avail !== Infinity && q >= avail}
                          onClick={() =>
                            setQuantities((prev) => ({
                              ...prev,
                              [t.id]: Math.min(avail === Infinity ? 20 : avail, q + 1),
                            }))
                          }
                        >
                          +
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 space-y-4 rounded-2xl border border-border/80 bg-card p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="bn">Full name</Label>
                  <Input id="bn" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="be">Email</Label>
                  <Input
                    id="be"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-lg font-semibold tabular-nums">
                  Total: ${(subtotalCents / 100).toFixed(2)}
                </p>
                <Button
                  type="button"
                  className="border-0 text-white shadow hover:opacity-90"
                  style={{ backgroundColor: accent }}
                  disabled={submitting || lines.length === 0 || subtotalCents <= 0}
                  onClick={handleCheckout}
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue to payment"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                You will be redirected to Stripe Checkout. A confirmation email with a QR code is sent after payment.
              </p>
            </div>
          </>
        )}

        {!hasStripePath && !p.external_ticket_url && (
          <p className="text-center text-muted-foreground">Ticket sales are not open for this program yet.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AwardTicketsPage;

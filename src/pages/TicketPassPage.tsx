import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Ticket } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

type PassPayload = {
  program_name: string;
  ceremony_at: string | null;
  buyer_name: string;
  line_items: Json;
  checked_in_at: string | null;
};

const TicketPassPage = () => {
  const { token } = useParams<{ token: string }>();

  const q = useQuery({
    queryKey: ["ticket-pass", token],
    enabled: Boolean(token),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_award_ticket_pass", { p_token: token! });
      if (error) throw error;
      return data as PassPayload | null;
    },
  });

  if (!token) return null;

  if (q.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pass = q.data;
  if (!pass) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-lg px-4 pt-28 pb-16 text-center">
          <h1 className="font-serif text-2xl font-bold">Ticket not found</h1>
          <p className="mt-2 text-muted-foreground">This link may be invalid or the purchase is not complete.</p>
          <Button asChild className="mt-8" variant="outline">
            <Link to="/awards">Award programs</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const lines = Array.isArray(pass.line_items)
    ? (pass.line_items as { name: string; quantity: number }[])
    : [];
  const ceremony =
    pass.ceremony_at &&
    (() => {
      try {
        return format(new Date(pass.ceremony_at), "EEEE, MMMM d, yyyy");
      } catch {
        return pass.ceremony_at;
      }
    })();

  const ticketUrl = typeof window !== "undefined" ? window.location.href : "";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(ticketUrl)}`;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`Ticket — ${pass.program_name}`} description="Your award ceremony ticket" canonicalUrl={`/ticket/${token}`} />
      <Header />
      <main className="container mx-auto max-w-lg px-4 pt-24 pb-16">
        <Card className="overflow-hidden rounded-2xl border-border/80 shadow-lg">
          <CardContent className="space-y-6 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">{pass.program_name}</h1>
              {ceremony && <p className="mt-1 text-sm text-muted-foreground">{ceremony}</p>}
            </div>
            <p className="text-lg font-medium">{pass.buyer_name}</p>
            <ul className="text-left text-sm text-muted-foreground">
              {lines.map((l, i) => (
                <li key={i}>
                  {l.name} × {l.quantity}
                </li>
              ))}
            </ul>
            <div className="flex justify-center">
              <img src={qrSrc} width={240} height={240} alt="" className="rounded-xl border border-border bg-white p-2" />
            </div>
            {pass.checked_in_at ? (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Checked in{" "}
                {format(new Date(pass.checked_in_at), "MMM d, h:mm a")}
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground">Present this code at the door for check-in.</p>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/awards">All programs</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default TicketPassPage;

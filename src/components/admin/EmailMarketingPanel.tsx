import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowRight,
  GitBranch,
  Loader2,
  Mail,
  Megaphone,
  Send,
  Sparkles,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_WORKFLOWS = [
  {
    id: "welcome",
    name: "New subscriber welcome",
    description: "Single email when someone joins your announcement list.",
    steps: ["Trigger: contact added to list “Announcements”", "Wait: immediate", "Send: Welcome template"],
    status: "draft" as const,
  },
  {
    id: "nominations",
    name: "Nominations reminder",
    description: "Timed nudge before nominations close.",
    steps: ["Trigger: 14 days before nominations end", "Send: Reminder A", "Wait: 7 days", "Send: Reminder B"],
    status: "draft" as const,
  },
  {
    id: "ceremony",
    name: "Ceremony week",
    description: "Short sequence around the live event.",
    steps: ["Trigger: 7 days before ceremony", "Send: Schedule + dress code", "Trigger: day-of", "Send: Doors open"],
    status: "draft" as const,
  },
] as const;

const TEMPLATES: { label: string; subject: string; html: string }[] = [
  {
    label: "Blank",
    subject: "",
    html: "<p>Hi there,</p><p></p><p>— Veteran Podcast Awards</p>",
  },
  {
    label: "Save the date",
    subject: "Save the date — Veteran Podcast Awards 2026",
    html: "<p>Hi there,</p><p>Mark your calendar for <strong>National Military Podcast Day</strong> and the Veteran Podcast Awards. We will share more soon.</p><p>— The VPA team</p>",
  },
  {
    label: "Nominate",
    subject: "Nominations are open",
    html: "<p>Hi there,</p><p>Nominations are open for this season. Log in to your podcaster dashboard to submit your show in the categories that fit you best.</p><p>— Veteran Podcast Awards</p>",
  },
];

export function EmailMarketingPanel() {
  const [to, setTo] = useState("");
  const [templateIndex, setTemplateIndex] = useState(1);
  const [subject, setSubject] = useState(TEMPLATES[1].subject);
  const [html, setHtml] = useState(TEMPLATES[1].html);

  useEffect(() => {
    const t = TEMPLATES[templateIndex];
    if (t) {
      setSubject(t.subject);
      setHtml(t.html);
    }
  }, [templateIndex]);

  const campaignsQuery = useQuery({
    queryKey: ["email-marketing-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("id, name, subject, status, sent_count, sent_at, created_at")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });

  const sendDemo = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke<{ ok?: boolean; error?: string }>("send-demo-email", {
        body: { to: to.trim(), subject: subject.trim(), html },
      });
      if (error) throw new Error(error.message);
      if (data && "error" in data && data.error) throw new Error(data.error as string);
      return data;
    },
    onSuccess: () => {
      toast.success("Email sent");
    },
    onError: (e: Error) => toast.error(e.message || "Send failed"),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-[#B8860B]" />
            Email marketing
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Demo tools: quick one-off sends, workflow ideas, and a snapshot of list campaigns. Full list sends and
            tracking live under{" "}
            <span className="font-medium text-foreground">Contacts → Campaigns</span>.
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 w-fit gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          Demo mode
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-[#B8860B]" />
              Quick send
            </CardTitle>
            <CardDescription>
              Send a one-off HTML email to any address (admin only). Uses Resend when{" "}
              <code className="text-xs">RESEND_API_KEY</code> is set on the project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="em-template">Starter template</Label>
              <select
                id="em-template"
                className={cn(
                  "mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                value={templateIndex}
                onChange={(e) => setTemplateIndex(Number(e.target.value))}
              >
                {TEMPLATES.map((t, i) => (
                  <option key={t.label} value={i}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="em-to">To</Label>
              <Input
                id="em-to"
                type="email"
                placeholder="you@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="em-subject">Subject</Label>
              <Input
                id="em-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="em-html">HTML body</Label>
              <Textarea
                id="em-html"
                rows={8}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="mt-1.5 font-mono text-xs"
              />
            </div>
            <Button
              type="button"
              className="w-full bg-[#B8860B] text-white hover:bg-[#9a7209]"
              disabled={sendDemo.isPending || !to.trim() || !subject.trim()}
              onClick={() => sendDemo.mutate()}
            >
              {sendDemo.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Workflow className="h-5 w-5 text-[#B8860B]" />
              Workflow library
            </CardTitle>
            <CardDescription>
              Placeholder automations for roadmap / stakeholder demos — not executed until connected to triggers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEMO_WORKFLOWS.map((wf) => (
              <div
                key={wf.id}
                className="rounded-xl border border-border/80 bg-muted/20 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{wf.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{wf.description}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 capitalize">
                    {wf.status}
                  </Badge>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground border-l-2 border-[#B8860B]/40 pl-3">
                  {wf.steps.map((s) => (
                    <li key={s} className="flex items-start gap-1.5">
                      <GitBranch className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-60" />
                      {s}
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" size="sm" className="mt-3 h-8 text-xs text-muted-foreground" disabled>
                  Configure (coming soon)
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent list campaigns</CardTitle>
          <CardDescription>Broadcasts created from Contacts → Send Campaign (opens / clicks in Metrics).</CardDescription>
        </CardHeader>
        <CardContent>
          {campaignsQuery.isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !(campaignsQuery.data?.length ?? 0) ? (
            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-xl">
              No campaigns yet. Import contacts and send one from the Contacts tab.
            </p>
          ) : (
            <ul className="divide-y divide-border/80 rounded-xl border border-border/80 overflow-hidden">
              {campaignsQuery.data!.map((c) => (
                <li key={c.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-card/50">
                  <div>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.subject}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{c.status}</Badge>
                    <span>{c.sent_count ?? 0} sent</span>
                    {c.sent_at && (
                      <span>{format(new Date(c.sent_at), "MMM d, yyyy")}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

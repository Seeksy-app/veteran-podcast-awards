import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Shield, Lock, Key, Database, Globe, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const securitySections = [
  {
    title: "Platform Architecture (High-Level)",
    icon: Database,
    content: [
      "Frontend: React/TypeScript, modular pages (Network, Awards, Dashboard, etc.)",
      "Backend: Lovable Cloud (Postgres + Edge Functions)",
      "Auth: JWT-based sessions with secure token handling",
      "Security Layers:",
    ],
    subItems: [
      "Row Level Security (RLS) on all sensitive tables",
      "Edge functions with verify_jwt = true for authenticated-only flows",
      "Encrypted secrets management for third-party integrations",
    ],
    summary: "This platform protects user, voter, and admin data across all VPA modules.",
  },
  {
    title: "Authentication & Authorization",
    icon: Key,
    content: [],
    authSection: {
      title: "Authentication:",
      items: [
        "Email/password authentication with secure password hashing",
        "All authenticated requests include signed JWT",
      ],
    },
    rolesSection: {
      title: "Roles / Personas (used in RLS + UI):",
      roles: [
        { role: "user", description: "standard fan/voter/account owner" },
        { role: "admin", description: "platform operators" },
        { role: "moderator", description: "content moderation access" },
        { role: "podcaster", description: "creator hub and profile management" },
      ],
    },
  },
  {
    title: "Row Level Security (RLS) Strategy",
    icon: Shield,
    policies: [
      { table: "profiles", policy: "Users can view/edit their own profile; public profiles visible to all" },
      { table: "votes", policy: "Users can only see and cast their own votes" },
      { table: "favorites", policy: "Users can only manage their own favorites" },
      { table: "podcaster_messages", policy: "Only recipient can view messages" },
      { table: "user_roles", policy: "Admin-only access; protected by security definer function" },
      { table: "sponsors", policy: "Public read; admin-only write" },
      { table: "podcasts", policy: "Public read for active podcasts; admin-only management" },
    ],
  },
  {
    title: "Edge Functions & API Security",
    icon: Globe,
    items: [
      "Most functions require verify_jwt = true",
      "JWT extraction + role validation on sensitive endpoints",
      "Resource ownership validation enforced",
      "Unauthenticated allowed for: RSS parsing, public podcast data",
    ],
  },
  {
    title: "Data Protection",
    icon: Lock,
    items: [
      "Secrets stored encrypted (Resend API key, etc.)",
      "No sensitive data exposed to client-side code",
      "Email sends tracked server-side only",
      "Campaign analytics protected by admin RLS",
    ],
  },
  {
    title: "Logging & Monitoring",
    icon: FileText,
    items: [
      "Auth failures logged",
      "RLS failures tracked",
      "Email send/open/click events captured",
      "Admin actions auditable",
    ],
  },
];

export type SecurityPanelProps = { variant?: "default" | "investor" };

export function SecurityPanel({ variant = "default" }: SecurityPanelProps) {
  const inv = variant === "investor";

  const cardInv =
    "border border-[#1E293B] border-l-4 border-l-[#F59E0B] bg-[#0F2035] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]";
  const execCard = cn(inv ? cardInv : "border-primary/20 bg-primary/5");

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className={cn("space-y-6", inv && "text-white")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Shield className={cn("h-8 w-8", inv ? "text-[#F59E0B]" : "text-primary")} />
          <div>
            <h2
              className={cn(
                "font-serif text-2xl font-bold",
                inv ? "text-[#F59E0B]" : "text-foreground",
              )}
            >
              VPA Security & Data Protection Overview
            </h2>
            <p className={cn(inv ? "text-[#94A3B8]" : "text-muted-foreground")}>
              Audience: Internal (Founders, Admins, Security Reviewers)
            </p>
            <p className={cn("text-xs", inv ? "text-[#94A3B8]/80" : "text-muted-foreground")}>
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button
          onClick={handleExportPDF}
          className={
            inv
              ? "shrink-0 border-0 bg-[#F59E0B] font-semibold text-[#0A1628] shadow-none transition-colors hover:bg-[#FBBF24]"
              : undefined
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Card className={execCard}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", inv && "text-[#F59E0B]")}>
            <CheckCircle className={cn("h-5 w-5", inv ? "text-[#F59E0B]" : "text-green-600")} />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn(inv ? "text-white" : "text-foreground")}>
            VPA implements enterprise-grade security with <strong className={inv ? "text-[#F59E0B]" : ""}>Row Level Security (RLS)</strong>,
            <strong className={inv ? "text-[#F59E0B]" : ""}> JWT authentication</strong>, and{" "}
            <strong className={inv ? "text-[#F59E0B]" : ""}>role-based access controls</strong>. All sensitive data is protected at the
            database level with proper access policies.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className={cn(inv && cardInv)}>
            <CardContent className="pt-6 text-center">
              <CheckCircle className={cn("mx-auto mb-2 h-8 w-8", inv ? "text-[#F59E0B]" : "text-green-600")} />
              <div className={cn("text-lg font-bold", inv && "text-white")}>
                {["RLS Enabled", "JWT Auth", "Role-Based", "Encrypted"][i]}
              </div>
              <div className={cn("text-sm", inv ? "text-[#94A3B8]" : "text-muted-foreground")}>
                {["All sensitive tables", "Secure sessions", "Access control", "Secrets storage"][i]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className={cn(inv && cardInv)}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", inv && "text-[#F59E0B]")}>
            <span className={cn("font-bold", inv ? "text-[#F59E0B]" : "text-primary")}>1.</span>
            {securitySections[0].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={inv ? "text-white" : "text-foreground"}>VPA is built on:</p>
          <ul className={cn("list-inside list-disc space-y-1", inv ? "text-[#94A3B8]" : "text-muted-foreground")}>
            {securitySections[0].content.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <ul className={cn("ml-6 list-inside list-disc space-y-1", inv ? "text-[#94A3B8]" : "text-muted-foreground")}>
            {securitySections[0].subItems?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p className={cn("mt-4 text-sm italic", inv ? "text-[#94A3B8]" : "text-muted-foreground")}>{securitySections[0].summary}</p>
        </CardContent>
      </Card>

      <Card className={cn(inv && cardInv)}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", inv && "text-[#F59E0B]")}>
            <span className={cn("font-bold", inv ? "text-[#F59E0B]" : "text-primary")}>2.</span>
            Authentication & Authorization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className={cn("mb-2 font-semibold", inv ? "text-white" : undefined)}>Authentication:</h4>
            <ul className={cn("list-inside list-disc space-y-1", inv ? "text-[#94A3B8]" : "text-muted-foreground")}>
              <li>Email/password authentication with secure password hashing</li>
              <li>All authenticated requests include signed JWT</li>
            </ul>
          </div>
          <hr className={inv ? "border-white/10" : "border-border"} />
          <div>
            <h4 className={cn("mb-3 font-semibold", inv ? "text-white" : undefined)}>Roles / Personas (used in RLS + UI):</h4>
            <div className="space-y-2">
              {[
                { role: "user", description: "standard fan/voter/account owner" },
                { role: "admin", description: "platform operators" },
                { role: "moderator", description: "content moderation access" },
              ].map((item) => (
                <div key={item.role} className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("font-mono", inv && "border-[#F59E0B]/50 text-[#F59E0B]")}>
                    {item.role}
                  </Badge>
                  <span className={inv ? "text-[#94A3B8]" : "text-muted-foreground"}>– {item.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(inv && cardInv)}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", inv && "text-[#F59E0B]")}>
            <span className={cn("font-bold", inv ? "text-[#F59E0B]" : "text-primary")}>3.</span>
            Row Level Security (RLS) Strategy
          </CardTitle>
          <CardDescription className={inv ? "text-[#94A3B8]" : undefined}>
            Core principle: Users only see their own data unless explicitly public
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securitySections[2].policies?.map((policy) => (
              <div key={policy.table} className={cn("border-l-2 pl-3", inv ? "border-[#F59E0B]/70" : "border-primary/30")}>
                <div className={cn("font-mono text-sm", inv ? "text-[#F59E0B]" : "text-primary")}>{policy.table}</div>
                <div className={cn("text-sm", inv ? "text-[#94A3B8]" : "text-muted-foreground")}>{policy.policy}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className={cn(inv && cardInv)}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", inv && "text-[#F59E0B]")}>
            <span className={cn("font-bold", inv ? "text-[#F59E0B]" : "text-primary")}>4.</span>
            Edge Functions & API Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className={cn("list-inside list-disc space-y-1", inv ? "text-[#94A3B8]" : "text-muted-foreground")}>
            {securitySections[3].items?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className={cn(inv && cardInv)}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", inv && "text-[#F59E0B]")}>
            <span className={cn("font-bold", inv ? "text-[#F59E0B]" : "text-primary")}>5.</span>
            Data Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className={cn("list-inside list-disc space-y-1", inv ? "text-[#94A3B8]" : "text-muted-foreground")}>
            {securitySections[4].items?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className={cn(inv && cardInv)}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", inv && "text-[#F59E0B]")}>
            <span className={cn("font-bold", inv ? "text-[#F59E0B]" : "text-primary")}>6.</span>
            Logging & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className={cn("list-inside list-disc space-y-1", inv ? "text-[#94A3B8]" : "text-muted-foreground")}>
            {securitySections[5].items?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className={cn(inv ? cn(cardInv, "bg-[#0F2035]") : "bg-muted/50")}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className={cn("mt-0.5 h-5 w-5", inv ? "text-[#F59E0B]" : "text-amber-500")} />
            <div>
              <h4 className={cn("font-semibold", inv ? "text-[#F59E0B]" : "text-foreground")}>Confidential</h4>
              <p className={cn("text-sm", inv ? "text-[#94A3B8]" : "text-muted-foreground")}>
                This document is intended for internal use by founders, administrators, and potential acquirers conducting due
                diligence. Do not distribute publicly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

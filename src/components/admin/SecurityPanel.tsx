import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Shield, Lock, Key, Database, Globe, FileText, AlertTriangle, CheckCircle } from "lucide-react";

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
    summary: "This platform protects user, voter, and admin data across all VPA modules."
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
      ]
    },
    rolesSection: {
      title: "Roles / Personas (used in RLS + UI):",
      roles: [
        { role: "user", description: "standard fan/voter/account owner" },
        { role: "admin", description: "platform operators" },
        { role: "moderator", description: "content moderation access" },
        { role: "podcaster", description: "creator hub and profile management" },
      ]
    }
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
    ]
  },
  {
    title: "Edge Functions & API Security",
    icon: Globe,
    items: [
      "Most functions require verify_jwt = true",
      "JWT extraction + role validation on sensitive endpoints",
      "Resource ownership validation enforced",
      "Unauthenticated allowed for: RSS parsing, public podcast data",
    ]
  },
  {
    title: "Data Protection",
    icon: Lock,
    items: [
      "Secrets stored encrypted (Resend API key, etc.)",
      "No sensitive data exposed to client-side code",
      "Email sends tracked server-side only",
      "Campaign analytics protected by admin RLS",
    ]
  },
  {
    title: "Logging & Monitoring",
    icon: FileText,
    items: [
      "Auth failures logged",
      "RLS failures tracked",
      "Email send/open/click events captured",
      "Admin actions auditable",
    ]
  },
];

export function SecurityPanel() {
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">VPA Security & Data Protection Overview</h2>
            <p className="text-muted-foreground">Audience: Internal (Founders, Admins, Security Reviewers)</p>
            <p className="text-xs text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <Button onClick={handleExportPDF}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Executive Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">
            VPA implements enterprise-grade security with <strong>Row Level Security (RLS)</strong>, 
            <strong> JWT authentication</strong>, and <strong>role-based access controls</strong>. 
            All sensitive data is protected at the database level with proper access policies.
          </p>
        </CardContent>
      </Card>

      {/* Security Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-bold text-lg">RLS Enabled</div>
            <div className="text-sm text-muted-foreground">All sensitive tables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-bold text-lg">JWT Auth</div>
            <div className="text-sm text-muted-foreground">Secure sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-bold text-lg">Role-Based</div>
            <div className="text-sm text-muted-foreground">Access control</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-bold text-lg">Encrypted</div>
            <div className="text-sm text-muted-foreground">Secrets storage</div>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: Platform Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary font-bold">1.</span>
            {securitySections[0].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">VPA is built on:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {securitySections[0].content.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-6">
            {securitySections[0].subItems?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground italic mt-4">
            {securitySections[0].summary}
          </p>
        </CardContent>
      </Card>

      {/* Section 2: Authentication & Authorization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary font-bold">2.</span>
            Authentication & Authorization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Authentication:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Email/password authentication with secure password hashing</li>
              <li>All authenticated requests include signed JWT</li>
            </ul>
          </div>
          <hr className="border-border" />
          <div>
            <h4 className="font-semibold mb-3">Roles / Personas (used in RLS + UI):</h4>
            <div className="space-y-2">
              {[
                { role: "user", description: "standard fan/voter/account owner" },
                { role: "admin", description: "platform operators" },
                { role: "moderator", description: "content moderation access" },
              ].map((item) => (
                <div key={item.role} className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">{item.role}</Badge>
                  <span className="text-muted-foreground">– {item.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: RLS Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary font-bold">3.</span>
            Row Level Security (RLS) Strategy
          </CardTitle>
          <CardDescription>Core principle: Users only see their own data unless explicitly public</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securitySections[2].policies?.map((policy) => (
              <div key={policy.table} className="border-l-2 border-primary/30 pl-3">
                <div className="font-mono text-sm text-primary">{policy.table}</div>
                <div className="text-sm text-muted-foreground">{policy.policy}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Edge Functions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary font-bold">4.</span>
            Edge Functions & API Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {securitySections[3].items?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section 5: Data Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary font-bold">5.</span>
            Data Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {securitySections[4].items?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section 6: Logging */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary font-bold">6.</span>
            Logging & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {securitySections[5].items?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">Confidential</h4>
              <p className="text-sm text-muted-foreground">
                This document is intended for internal use by founders, administrators, and potential acquirers 
                conducting due diligence. Do not distribute publicly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

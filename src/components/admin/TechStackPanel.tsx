import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Code, Database, Cloud, Bot, Shield, Zap, Mail, Globe, Server, Key, FileText, Layers } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const frontendStack = [
  { name: "React 18.3", license: "MIT", purpose: "Core UI library with hooks and concurrent rendering", category: "Framework" },
  { name: "TypeScript", license: "Apache-2.0", purpose: "Type-safe JavaScript for robust, maintainable code", category: "Language" },
  { name: "Vite", license: "MIT", purpose: "Next-generation build tool and dev server", category: "Build Tool" },
  { name: "Tailwind CSS", license: "MIT", purpose: "Utility-first CSS framework for rapid UI development", category: "Styling" },
  { name: "React Router DOM 6", license: "MIT", purpose: "Client-side routing and navigation", category: "Routing" },
  { name: "TanStack React Query 5", license: "MIT", purpose: "Server state management, caching, and data fetching", category: "Data" },
  { name: "React Hook Form", license: "MIT", purpose: "Performant form handling with validation", category: "Forms" },
  { name: "Zod", license: "MIT", purpose: "Schema validation for forms and API data", category: "Validation" },
  { name: "Recharts", license: "MIT", purpose: "Data visualization and charting library", category: "Charts" },
  { name: "Framer Motion (via tailwindcss-animate)", license: "MIT", purpose: "Animation and transitions", category: "Animation" },
  { name: "Radix UI Primitives", license: "MIT", purpose: "Accessible, unstyled UI component primitives (20+ components)", category: "UI Library" },
  { name: "shadcn/ui", license: "MIT", purpose: "Pre-built component library built on Radix UI", category: "UI Library" },
  { name: "Lucide React", license: "ISC", purpose: "Icon library (462+ icons)", category: "Icons" },
  { name: "date-fns", license: "MIT", purpose: "Date utility library", category: "Utilities" },
  { name: "class-variance-authority", license: "Apache-2.0", purpose: "Component variant management", category: "Utilities" },
  { name: "clsx / tailwind-merge", license: "MIT", purpose: "Conditional CSS class composition", category: "Utilities" },
  { name: "Sonner", license: "MIT", purpose: "Toast notification system", category: "UI" },
  { name: "Embla Carousel", license: "MIT", purpose: "Carousel/slider component", category: "UI" },
  { name: "Vaul", license: "MIT", purpose: "Drawer component for mobile UI", category: "UI" },
  { name: "cmdk", license: "MIT", purpose: "Command palette component", category: "UI" },
  { name: "React Helmet Async", license: "MIT", purpose: "SEO meta tag management", category: "SEO" },
  { name: "React Day Picker", license: "MIT", purpose: "Date picker component", category: "UI" },
  { name: "input-otp", license: "MIT", purpose: "One-time password input component", category: "UI" },
  { name: "react-resizable-panels", license: "MIT", purpose: "Resizable panel layouts", category: "UI" },
];

const backendStack = [
  { name: "Lovable Cloud (PostgreSQL)", license: "Proprietary / PostgreSQL License", purpose: "Primary relational database with real-time capabilities", category: "Database" },
  { name: "Supabase Auth", license: "Apache-2.0", purpose: "Authentication system with email/password, OAuth, JWT", category: "Auth" },
  { name: "Supabase Edge Functions (Deno)", license: "MIT", purpose: "Serverless TypeScript functions at the edge", category: "Compute" },
  { name: "Supabase Storage", license: "Apache-2.0", purpose: "Object storage for media (avatars, videos, sponsor logos)", category: "Storage" },
  { name: "Row Level Security (RLS)", license: "PostgreSQL", purpose: "Database-level access control policies", category: "Security" },
  { name: "Supabase Realtime", license: "Apache-2.0", purpose: "WebSocket-based real-time data subscriptions", category: "Real-time" },
  { name: "Supabase JS SDK v2", license: "MIT", purpose: "Client library for database, auth, and storage operations", category: "SDK" },
];

const edgeFunctions = [
  { name: "parse-rss", purpose: "Fetches and parses podcast RSS/XML feeds, extracts episodes, updates database", auth: "No JWT", apis: "External RSS feeds via fetch()" },
  { name: "podcast-assistant", purpose: "AI-powered podcast discovery chatbot using Gemini 2.5 Flash", auth: "No JWT", apis: "Lovable AI Gateway (ai.gateway.lovable.dev)" },
  { name: "send-campaign", purpose: "Bulk email campaigns with personalization, open/click tracking pixels", auth: "JWT Required", apis: "Resend Email API (api.resend.com)" },
  { name: "send-podcaster-contact", purpose: "Transactional email notifications for podcaster contact messages", auth: "No JWT", apis: "Resend Email API via SDK" },
  { name: "track-email", purpose: "Tracks email opens (1x1 pixel) and click-throughs with redirect", auth: "No JWT", apis: "Internal DB operations only" },
];

const externalAPIs = [
  { name: "Resend", purpose: "Transactional and bulk email delivery", endpoint: "api.resend.com/emails", authMethod: "Bearer API Key", secretName: "RESEND_API_KEY", usage: "Email campaigns, contact notifications" },
  { name: "Lovable AI Gateway", purpose: "AI model access (Gemini 2.5 Flash)", endpoint: "ai.gateway.lovable.dev/v1/chat/completions", authMethod: "Bearer LOVABLE_API_KEY", secretName: "LOVABLE_API_KEY", usage: "Podcast discovery chatbot" },
  { name: "External RSS Feeds", purpose: "Podcast feed ingestion", endpoint: "Various podcast RSS URLs", authMethod: "None (public)", secretName: "N/A", usage: "Podcast data import and episode sync" },
];

const databaseTables = [
  { name: "profiles", records: "User profiles", rls: "Own data + public profiles" },
  { name: "user_roles", records: "Role assignments (admin/mod/user)", rls: "Admin manage, users view own" },
  { name: "podcasts", records: "Podcast listings with episodes (JSON)", rls: "Admin manage, public view active" },
  { name: "podcast_contacts", records: "CRM contact database", rls: "Admin only" },
  { name: "podcast_submissions", records: "User-submitted podcasts", rls: "Public insert, admin manage" },
  { name: "podcaster_messages", records: "Direct messages to podcasters", rls: "Public insert, recipient view" },
  { name: "favorites", records: "User podcast favorites", rls: "Own data only" },
  { name: "votes", records: "Award category votes", rls: "Own data only" },
  { name: "vote_counts", records: "Aggregated vote tallies", rls: "Public read, admin manage" },
  { name: "awards_config", records: "Award ceremony configuration", rls: "Public read, admin manage" },
  { name: "featured_nominees", records: "Featured award nominees", rls: "Public read active" },
  { name: "sponsors", records: "Sponsor listings with tiers", rls: "Public read active, admin manage" },
  { name: "investor_access", records: "Investor portal access codes", rls: "Admin only" },
  { name: "investor_videos", records: "Investor presentation videos", rls: "Public read active, admin manage" },
  { name: "investor_engagement_events", records: "Investor activity tracking", rls: "Public insert, admin view" },
  { name: "deck_engagement_events", records: "VPA Deck page analytics", rls: "Public insert, admin view" },
  { name: "email_campaigns", records: "Email campaign metadata", rls: "Admin only" },
  { name: "email_sends", records: "Individual email send records", rls: "Admin only" },
  { name: "mailing_lists", records: "Contact list definitions", rls: "Admin only" },
  { name: "smart_lists", records: "Dynamic filter-based lists", rls: "Admin only" },
  { name: "pre_registrations", records: "Pre-launch signups", rls: "Public insert only" },
  { name: "promotional_assets", records: "Podcast promotional media", rls: "Public read, admin manage" },
];

const storageBuckets = [
  { name: "avatars", public: true, purpose: "User profile images" },
  { name: "videos", public: true, purpose: "Investor presentation videos" },
  { name: "sponsor-logos", public: true, purpose: "Sponsor brand logos" },
];

const secrets = [
  { name: "SUPABASE_URL", purpose: "Database connection URL" },
  { name: "SUPABASE_ANON_KEY", purpose: "Public anonymous access key" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", purpose: "Admin-level service key (server-side only)" },
  { name: "SUPABASE_DB_URL", purpose: "Direct PostgreSQL connection string" },
  { name: "RESEND_API_KEY", purpose: "Email delivery service credentials" },
  { name: "LOVABLE_API_KEY", purpose: "AI gateway authentication" },
];

const ipAssets = [
  { name: "VPA Podcast Discovery Algorithm", type: "Software", description: "AI-powered recommendation engine using Gemini model with curated prompt engineering" },
  { name: "RSS Feed Parser", type: "Software", description: "Custom XML parser for podcast RSS/Atom feeds with multi-format support" },
  { name: "Email Campaign Engine", type: "Software", description: "Bulk email system with personalization, tracking pixels, and click analytics" },
  { name: "Investor Engagement Tracker", type: "Software", description: "Real-time analytics for investor portal interactions, scroll depth, and video engagement" },
  { name: "Deck Engagement Analytics", type: "Software", description: "Session-based tracking for VPA acquisition deck with time-on-page and scroll metrics" },
  { name: "Veteran Podcast Awards Brand", type: "Trademark", description: "Brand identity, logo, domain (veteranpodcastawards.com), and design system" },
  { name: "Award Category System", type: "Software", description: "Voting, nomination, and category management with real-time vote tallying" },
  { name: "Contact CRM System", type: "Software", description: "Podcast contact management with tags, lists, smart filters, and email integration" },
  { name: "Role-Based Admin Dashboard", type: "Software", description: "Multi-tab admin panel with user management, analytics, and content moderation" },
  { name: "Podcaster Profile System", type: "Software", description: "Public profiles with messaging, social links, and podcast integration" },
];

export function TechStackPanel() {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Technology & IP Inventory</h2>
          <p className="text-muted-foreground">Complete intellectual property and technology audit for VPA platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ip-summary" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="ip-summary" className="gap-1.5">
            <FileText className="w-4 h-4" />
            IP Summary
          </TabsTrigger>
          <TabsTrigger value="frontend" className="gap-1.5">
            <Code className="w-4 h-4" />
            Frontend
          </TabsTrigger>
          <TabsTrigger value="backend" className="gap-1.5">
            <Database className="w-4 h-4" />
            Backend
          </TabsTrigger>
          <TabsTrigger value="edge-functions" className="gap-1.5">
            <Server className="w-4 h-4" />
            Edge Functions
          </TabsTrigger>
          <TabsTrigger value="apis" className="gap-1.5">
            <Globe className="w-4 h-4" />
            External APIs
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-1.5">
            <Layers className="w-4 h-4" />
            Database Schema
          </TabsTrigger>
          <TabsTrigger value="secrets" className="gap-1.5">
            <Key className="w-4 h-4" />
            Secrets & Keys
          </TabsTrigger>
        </TabsList>

        {/* IP Summary */}
        <TabsContent value="ip-summary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Intellectual Property Assets</CardTitle>
              <CardDescription>Proprietary software, trademarks, and digital assets included in acquisition</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipAssets.map((asset) => (
                    <TableRow key={asset.name}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell><Badge variant={asset.type === "Trademark" ? "default" : "secondary"}>{asset.type}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{asset.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-4 bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Platform Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-3xl font-bold text-primary">{frontendStack.length + backendStack.length}</div>
                  <div className="text-sm text-muted-foreground">Dependencies</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-3xl font-bold text-primary">{edgeFunctions.length}</div>
                  <div className="text-sm text-muted-foreground">Edge Functions</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-3xl font-bold text-primary">{databaseTables.length}</div>
                  <div className="text-sm text-muted-foreground">DB Tables</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-3xl font-bold text-primary">{externalAPIs.length}</div>
                  <div className="text-sm text-muted-foreground">External APIs</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-3xl font-bold text-primary">{storageBuckets.length}</div>
                  <div className="text-sm text-muted-foreground">Storage Buckets</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Frontend */}
        <TabsContent value="frontend">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Code className="w-5 h-5 text-primary" /> Frontend Dependencies ({frontendStack.length})</CardTitle>
              <CardDescription>All client-side libraries and frameworks</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {frontendStack.map((pkg) => (
                    <TableRow key={pkg.name}>
                      <TableCell className="font-medium font-mono text-sm">{pkg.name}</TableCell>
                      <TableCell><Badge variant="outline">{pkg.category}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{pkg.license}</TableCell>
                      <TableCell className="text-muted-foreground">{pkg.purpose}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backend */}
        <TabsContent value="backend">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> Backend Infrastructure</CardTitle>
              <CardDescription>Server-side services and infrastructure</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backendStack.map((svc) => (
                    <TableRow key={svc.name}>
                      <TableCell className="font-medium">{svc.name}</TableCell>
                      <TableCell><Badge variant="outline">{svc.category}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{svc.license}</TableCell>
                      <TableCell className="text-muted-foreground">{svc.purpose}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Cloud className="w-5 h-5 text-primary" /> Storage Buckets</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bucket</TableHead>
                    <TableHead>Public</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storageBuckets.map((bucket) => (
                    <TableRow key={bucket.name}>
                      <TableCell className="font-medium font-mono">{bucket.name}</TableCell>
                      <TableCell><Badge variant={bucket.public ? "default" : "secondary"}>{bucket.public ? "Yes" : "No"}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{bucket.purpose}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edge Functions */}
        <TabsContent value="edge-functions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Server className="w-5 h-5 text-primary" /> Edge Functions ({edgeFunctions.length})</CardTitle>
              <CardDescription>Serverless TypeScript functions deployed at the edge</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Function</TableHead>
                    <TableHead>Auth</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>External APIs Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {edgeFunctions.map((fn) => (
                    <TableRow key={fn.name}>
                      <TableCell className="font-medium font-mono">{fn.name}</TableCell>
                      <TableCell><Badge variant={fn.auth === "JWT Required" ? "default" : "secondary"}>{fn.auth}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{fn.purpose}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{fn.apis}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* External APIs */}
        <TabsContent value="apis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> External API Integrations</CardTitle>
              <CardDescription>Third-party services the platform depends on</CardDescription>
            </CardHeader>
            <CardContent>
              {externalAPIs.map((api) => (
                <Card key={api.name} className="mb-4 border-l-4 border-l-primary/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{api.name}</h3>
                      <Badge>{api.authMethod}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Endpoint:</span> <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{api.endpoint}</code></div>
                      <div><span className="text-muted-foreground">Secret:</span> <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{api.secretName}</code></div>
                      <div className="md:col-span-2"><span className="text-muted-foreground">Usage:</span> {api.usage}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Schema */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-primary" /> Database Tables ({databaseTables.length})</CardTitle>
              <CardDescription>Complete schema with Row Level Security policies</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>RLS Policy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {databaseTables.map((table) => (
                    <TableRow key={table.name}>
                      <TableCell className="font-medium font-mono">{table.name}</TableCell>
                      <TableCell className="text-muted-foreground">{table.records}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{table.rls}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Secrets */}
        <TabsContent value="secrets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-primary" /> Configured Secrets & API Keys</CardTitle>
              <CardDescription>Environment variables required for platform operation (values not shown)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Secret Name</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {secrets.map((secret) => (
                    <TableRow key={secret.name}>
                      <TableCell className="font-medium font-mono">{secret.name}</TableCell>
                      <TableCell className="text-muted-foreground">{secret.purpose}</TableCell>
                      <TableCell><Badge variant="default">Configured</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-4 border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><Shield className="w-5 h-5" /> Transfer Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• All API keys will need to be transferred or regenerated for the acquiring party.</p>
              <p>• Resend account ownership and sending domain (veteranpodcastawards.com) must be transferred.</p>
              <p>• Lovable Cloud project access and ownership must be transferred.</p>
              <p>• Domain registrar access for veteranpodcastawards.com must be included.</p>
              <p>• All storage bucket contents (avatars, videos, sponsor logos) are included with the database.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

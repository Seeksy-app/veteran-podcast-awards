import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Code, Database, Cloud, Bot, Shield, Zap } from "lucide-react";

const techCategories = [
  {
    title: "Frontend Framework",
    icon: Code,
    items: [
      { name: "React 18", description: "Modern UI library with hooks and concurrent features" },
      { name: "TypeScript", description: "Type-safe JavaScript for robust code" },
      { name: "Vite", description: "Next-generation frontend tooling" },
      { name: "Tailwind CSS", description: "Utility-first CSS framework" },
    ]
  },
  {
    title: "Backend & Database",
    icon: Database,
    items: [
      { name: "Lovable Cloud", description: "PostgreSQL database with real-time capabilities" },
      { name: "Edge Functions", description: "Serverless TypeScript functions" },
      { name: "Row Level Security", description: "Database-level security policies" },
    ]
  },
  {
    title: "Cloud Infrastructure",
    icon: Cloud,
    items: [
      { name: "Lovable Cloud", description: "Full-stack cloud platform" },
      { name: "CDN Delivery", description: "Global content delivery network" },
      { name: "Storage Buckets", description: "Object storage for media files" },
    ]
  },
  {
    title: "AI & Processing",
    icon: Bot,
    items: [
      { name: "Lovable AI", description: "Integrated AI capabilities" },
      { name: "Podcast Discovery", description: "AI-powered recommendations" },
      { name: "RSS Parsing", description: "Automated podcast feed processing" },
    ]
  },
  {
    title: "Authentication & Security",
    icon: Shield,
    items: [
      { name: "Auth System", description: "Email, OAuth, and MFA support" },
      { name: "JWT Tokens", description: "Secure session management" },
      { name: "Role-Based Access", description: "Admin, moderator, user roles" },
    ]
  },
  {
    title: "Performance & Optimization",
    icon: Zap,
    items: [
      { name: "React Query", description: "Data fetching and caching" },
      { name: "Lazy Loading", description: "Optimized component loading" },
      { name: "Image Optimization", description: "Efficient media delivery" },
    ]
  },
];

export function TechStackPanel() {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print(); // Browser print dialog allows saving as PDF
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Tech Stack</h2>
          <p className="text-muted-foreground">Modern, scalable technologies powering VPA platform</p>
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

      <div className="grid gap-6 md:grid-cols-2">
        {techCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <category.icon className="w-5 h-5 text-primary" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.items.map((item) => (
                <div key={item.name} className="border-l-2 border-primary/30 pl-3">
                  <div className="font-medium text-foreground">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Development Statistics</CardTitle>
          <CardDescription>Platform development metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-3xl font-bold text-primary">240+</div>
              <div className="text-sm text-muted-foreground">Dev Hours</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Components</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-3xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Edge Functions</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-3xl font-bold text-primary">20+</div>
              <div className="text-sm text-muted-foreground">DB Tables</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

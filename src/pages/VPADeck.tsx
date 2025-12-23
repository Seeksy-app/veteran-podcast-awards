import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Video, 
  FileText, 
  Code, 
  Shield, 
  Download,
  TrendingUp, 
  DollarSign, 
  Users, 
  Mic, 
  Trophy, 
  Tv, 
  Mail, 
  Share2,
  Clock,
  Rocket,
  Target,
  Building,
  Star,
  Zap,
  BarChart3,
  Globe,
  CheckCircle2,
  Database,
  Cloud,
  Bot,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import logo from "@/assets/vpa-logo.png";
import { SEO } from "@/components/SEO";

interface InvestorVideo {
  id: string;
  title: string;
  video_url: string;
  description: string | null;
  display_order: number;
}

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
      { name: "PostgreSQL", description: "Enterprise-grade database with real-time capabilities" },
      { name: "Edge Functions", description: "Serverless TypeScript functions" },
      { name: "Row Level Security", description: "Database-level security policies" },
    ]
  },
  {
    title: "Cloud Infrastructure",
    icon: Cloud,
    items: [
      { name: "Full-Stack Cloud", description: "Scalable cloud platform" },
      { name: "CDN Delivery", description: "Global content delivery network" },
      { name: "Storage Buckets", description: "Object storage for media files" },
    ]
  },
  {
    title: "AI & Processing",
    icon: Bot,
    items: [
      { name: "AI Integration", description: "Integrated AI capabilities" },
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

const securityPolicies = [
  { table: "profiles", policy: "Users can view/edit their own profile; public profiles visible to all" },
  { table: "votes", policy: "Users can only see and cast their own votes" },
  { table: "favorites", policy: "Users can only manage their own favorites" },
  { table: "podcaster_messages", policy: "Only recipient can view messages" },
  { table: "user_roles", policy: "Admin-only access; protected by security definer function" },
  { table: "sponsors", policy: "Public read; admin-only write" },
  { table: "podcasts", policy: "Public read for active podcasts; admin-only management" },
];

const VPADeck = () => {
  const [video, setVideo] = useState<InvestorVideo | null>(null);
  const [activeSection, setActiveSection] = useState("video");

  const videoRef = useRef<HTMLElement>(null);
  const opportunityRef = useRef<HTMLElement>(null);
  const techRef = useRef<HTMLElement>(null);
  const securityRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      const { data } = await supabase
        .from("investor_videos")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(1)
        .single();
      
      if (data) setVideo(data);
    };
    fetchVideo();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "video", ref: videoRef },
        { id: "opportunity", ref: opportunityRef },
        { id: "tech", ref: techRef },
        { id: "security", ref: securityRef },
      ];

      for (const section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom > 100) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const refs: Record<string, React.RefObject<HTMLElement>> = {
      video: videoRef,
      opportunity: opportunityRef,
      tech: techRef,
      security: securityRef,
    };
    refs[sectionId]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const navItems = [
    { id: "video", label: "Video", icon: Video },
    { id: "opportunity", label: "Opportunity", icon: FileText },
    { id: "tech", label: "Tech Stack", icon: Code },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 print:bg-white">
      <SEO 
        title="VPA Investment Deck | Veteran Podcast Awards"
        description="Exclusive investment opportunity in the Veteran Podcast Awards platform - the flagship recognition platform in the military/veteran media space."
      />

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 print:hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <img src={logo} alt="VPA Logo" className="h-8 w-auto" />
              <div className="flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? "bg-amber-100 text-amber-900"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleDownloadPDF} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-16">
        {/* Video Section */}
        <section ref={videoRef} id="video" className="scroll-mt-20">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-300">
              Investment Overview
            </Badge>
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">
              Veteran Podcast Awards
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A flagship recognition platform in the military/veteran media space with proven technology and established brand equity.
            </p>
          </div>

          {video && (
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 shadow-lg">
              <iframe
                src={video.video_url}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </section>

        {/* Opportunity Section */}
        <section ref={opportunityRef} id="opportunity" className="scroll-mt-20 print:break-before-page">
          <div className="mb-8">
            <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-300">
              Strategic Opportunity
            </Badge>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
              Investment Opportunity for Recurrent Media
            </h2>
          </div>

          {/* Recurrent Introduction */}
          <Card className="mb-8 border-2 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-200 rounded-full shrink-0">
                  <Building className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    A Perfect Fit for Recurrent's Media Portfolio
                  </h3>
                  <p className="text-slate-700 mb-4">
                    <strong>Recurrent</strong> has built an impressive portfolio of trusted editorial brands serving passionate audiences—from <em>Popular Science</em> and <em>Outdoor Life</em> to military-focused properties like <strong>Task & Purpose</strong> and <strong>Donut</strong>. With 72M+ unique monthly visitors and deep expertise in audience-first media, Recurrent is uniquely positioned to amplify the Veteran Podcast Awards.
                  </p>
                  <p className="text-slate-700 mb-4">
                    <strong>The VPA represents a strategic expansion</strong> into streaming and podcast advertising—a rapidly growing market segment. As traditional digital advertising becomes more competitive, owning the premier awards platform in the military podcast space provides:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                    <li><strong>Cross-Platform Synergy:</strong> Leverage Task & Purpose and Donut audiences to amplify VPA reach</li>
                    <li><strong>Streaming Ad Inventory:</strong> Direct access to engaged military/veteran podcast audiences</li>
                    <li><strong>Event Revenue:</strong> Monetizable sponsorship tiers and livestream advertising</li>
                    <li><strong>Community Ownership:</strong> Become the convener of the military podcast ecosystem</li>
                  </ul>
                  <p className="text-slate-600 text-sm italic">
                    This acquisition positions Recurrent as the definitive voice in military media, spanning written editorial, video content, and now audio/podcast recognition.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Audience */}
          <Card className="mb-8 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-center text-lg text-slate-600 uppercase tracking-wider">
                Available Audience to Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-2">18M+</div>
                  <div className="text-sm text-slate-600">Veterans in the U.S.</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-2">2M+</div>
                  <div className="text-sm text-slate-600">Active Duty Service Members</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-2">40M+</div>
                  <div className="text-sm text-slate-600">Military-Connected Americans</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-2">500K+</div>
                  <div className="text-sm text-slate-600">Combined Social Media Reach</div>
                </div>
              </div>
              <p className="text-center text-sm text-slate-500 mt-4 italic">
                These figures represent the addressable market—an untapped audience that, when targeted, could significantly elevate the value of this property.
              </p>
            </CardContent>
          </Card>

          {/* Sponsorship Opportunities */}
          <Card className="mb-8 bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <DollarSign className="w-6 h-6 text-amber-600" />
                Example 2026 Sponsorship Opportunities
              </CardTitle>
              <CardDescription>
                Multiple revenue streams through tiered sponsorship packages designed for brands seeking authentic connection with the military community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-center">
                  <Trophy className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">Presenting</h3>
                  <p className="text-xs text-slate-600">Title naming rights</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <Star className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">Category</h3>
                  <p className="text-xs text-slate-600">Award category sponsor</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">Award</h3>
                  <p className="text-xs text-slate-600">Individual award sponsor</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <Tv className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">Livestream</h3>
                  <p className="text-xs text-slate-600">Broadcast integration</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">& More</h3>
                  <p className="text-xs text-slate-600">Custom packages</p>
                </div>
              </div>
              <p className="text-center text-sm text-slate-500 mt-6 italic">
                Sponsorship tiers range from $10K engagement packages to $100K+ presenting partnerships
              </p>
            </CardContent>
          </Card>

          {/* Technology Value */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Development Investment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600 mb-2">240 Hours</div>
                <p className="text-sm text-slate-600">Development time invested in platform</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Replacement Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600 mb-2">~$75,000</div>
                <p className="text-sm text-slate-600">Not including hosting, integrations, future upgrades</p>
              </CardContent>
            </Card>
          </div>

          {/* What's Included */}
          <Card className="mb-8 border-2 border-slate-300">
            <CardHeader>
              <CardTitle className="text-slate-900">What's Included in the Acquisition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Complete intellectual property (IP)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Front-end & back-end technology stack</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Veteran Podcast Awards name & branding</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">All URLs and domains</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">National Military Podcast Day ownership</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Existing user database & contacts</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Growth Projections */}
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <BarChart3 className="w-6 h-6 text-amber-600" />
                Growth Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border-t-4 border-blue-500">
                  <Badge variant="outline" className="mb-2">Year 1</Badge>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">2026</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500">Revenue</div>
                      <div className="text-xl font-bold text-blue-600">$400K–$500K</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Impressions</div>
                      <div className="text-xl font-bold text-slate-900">5M+</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 border-t-4 border-purple-500">
                  <Badge variant="outline" className="mb-2">Year 2</Badge>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">2027</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500">Revenue</div>
                      <div className="text-xl font-bold text-purple-600">$750K–$1M</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Impressions</div>
                      <div className="text-xl font-bold text-slate-900">8M+</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 border-t-4 border-amber-500">
                  <Badge variant="outline" className="mb-2 bg-amber-100 text-amber-800">Year 3</Badge>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">2028</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500">Revenue</div>
                      <div className="text-xl font-bold text-amber-600">$1.5M–$2M</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Impressions</div>
                      <div className="text-xl font-bold text-slate-900">15M+</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tech Stack Section */}
        <section ref={techRef} id="tech" className="scroll-mt-20 print:break-before-page">
          <div className="mb-8">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-300">
              Technology Overview
            </Badge>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
              Tech Stack
            </h2>
            <p className="text-slate-600">Modern, scalable technologies powering the VPA platform</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {techCategories.map((category) => (
              <Card key={category.title} className="bg-white border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                    <category.icon className="w-5 h-5 text-blue-600" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.items.map((item) => (
                    <div key={item.name} className="border-l-2 border-blue-200 pl-3">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-sm text-slate-600">{item.description}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Development Statistics</CardTitle>
              <CardDescription>Platform development metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                  <div className="text-3xl font-bold text-blue-600">240+</div>
                  <div className="text-sm text-slate-600">Dev Hours</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                  <div className="text-3xl font-bold text-blue-600">50+</div>
                  <div className="text-sm text-slate-600">Components</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                  <div className="text-3xl font-bold text-blue-600">5</div>
                  <div className="text-sm text-slate-600">Edge Functions</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                  <div className="text-3xl font-bold text-blue-600">20+</div>
                  <div className="text-sm text-slate-600">DB Tables</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Security Section */}
        <section ref={securityRef} id="security" className="scroll-mt-20 print:break-before-page">
          <div className="mb-8">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-300">
              Security Overview
            </Badge>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
              Security & Data Protection
            </h2>
            <p className="text-slate-600">Enterprise-grade security measures protecting user data</p>
          </div>

          {/* Executive Summary */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">
                VPA implements enterprise-grade security with <strong>Row Level Security (RLS)</strong>, 
                <strong> JWT authentication</strong>, and <strong>role-based access controls</strong>. 
                All sensitive data is protected at the database level with proper access policies.
              </p>
            </CardContent>
          </Card>

          {/* Security Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-lg text-slate-900">RLS Enabled</div>
                <div className="text-sm text-slate-600">All sensitive tables</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-lg text-slate-900">JWT Auth</div>
                <div className="text-sm text-slate-600">Secure sessions</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-lg text-slate-900">Role-Based</div>
                <div className="text-sm text-slate-600">Access control</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-lg text-slate-900">Encrypted</div>
                <div className="text-sm text-slate-600">Secrets storage</div>
              </CardContent>
            </Card>
          </div>

          {/* Authentication */}
          <Card className="mb-8 bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Key className="w-5 h-5 text-slate-700" />
                Authentication & Authorization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 text-slate-900">Authentication:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Email/password authentication with secure password hashing</li>
                  <li>All authenticated requests include signed JWT</li>
                </ul>
              </div>
              <hr className="border-slate-200" />
              <div>
                <h4 className="font-semibold mb-3 text-slate-900">Roles / Personas:</h4>
                <div className="space-y-2">
                  {[
                    { role: "user", description: "standard fan/voter/account owner" },
                    { role: "admin", description: "platform operators" },
                    { role: "moderator", description: "content moderation access" },
                  ].map((item) => (
                    <div key={item.role} className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono bg-slate-100">{item.role}</Badge>
                      <span className="text-slate-600">– {item.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RLS Strategy */}
          <Card className="mb-8 bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Shield className="w-5 h-5 text-slate-700" />
                Row Level Security (RLS) Strategy
              </CardTitle>
              <CardDescription>Core principle: Users only see their own data unless explicitly public</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityPolicies.map((policy) => (
                  <div key={policy.table} className="border-l-2 border-green-300 pl-3">
                    <div className="font-mono text-sm text-green-700">{policy.table}</div>
                    <div className="text-sm text-slate-600">{policy.policy}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Confidential Footer */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Confidential</h4>
                  <p className="text-sm text-slate-600">
                    This document is intended for internal use by founders, administrators, and potential acquirers 
                    conducting due diligence. Do not distribute publicly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Veteran Podcast Awards. All rights reserved.
          </p>
        </footer>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          nav { display: none !important; }
          .print\\:break-before-page { break-before: page; }
          body { background: white !important; }
          * { color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

export default VPADeck;

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import { 
  Calendar, 
  Mic, 
  Heart, 
  Share2, 
  MessageCircle, 
  Star, 
  Users,
  ExternalLink,
  Twitter,
  Facebook,
  Linkedin
} from "lucide-react";
import podcastDayLogo from "@/assets/national-military-podcast-day.png";

const celebrationIdeas = [
  {
    icon: MessageCircle,
    title: "Engage on Social Media",
    description: "Use #MilitaryPodcastDay to engage with other veteran podcasters talking about the event."
  },
  {
    icon: Mic,
    title: "Ask About Favorites",
    description: "Grab your mic and camera, ask someone about their favorite podcast. Share the response on social media!"
  },
  {
    icon: Share2,
    title: "Promote the Day",
    description: "Promote by posting the official banner image on your website and changing your social media image."
  },
  {
    icon: Users,
    title: "Spread the Word",
    description: "Explain to someone what a podcast is and get them hooked on the medium."
  },
  {
    icon: Heart,
    title: "Share Your Favorites",
    description: "Share your favorite podcast with someone - a coworker, friend, or teammate."
  },
  {
    icon: Star,
    title: "Show Appreciation",
    description: "Send feedback to your favorite podcasters and tell them thank you. Leave ratings and reviews!"
  }
];

const PodcastDay = () => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://veteranpodcastawards.com/podcast-day';
  const shareText = "Celebrate National Military Podcast Day on October 5th! #MilitaryPodcastDay";

  const podcastDayStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'National Military Podcast Day',
    startDate: '2026-10-05',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://veteranpodcastawards.com/podcast-day'
    },
    description: 'National Military Podcast Day celebrates military podcasters using their platforms to share stories and find healing. October 5th annually.',
    organizer: {
      '@type': 'Organization',
      name: 'Veteran Podcast Awards',
      url: 'https://veteranpodcastawards.com'
    }
  };

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'National Military Podcast Day',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="National Military Podcast Day - October 5th"
        description="Celebrate National Military Podcast Day on October 5th. Honor veteran podcasters who use their platforms to share stories, promote businesses, and find healing through voice."
        keywords="national military podcast day, military podcast day, october 5, veteran podcasters, military podcasting, PTSD therapy, veteran voices"
        canonicalUrl="/podcast-day"
        structuredData={podcastDayStructuredData}
      />
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Calendar className="w-4 h-4" />
                  October 5th, Every Year
                </div>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  National Military{" "}
                  <span className="text-gold-gradient">Podcast Day</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                  Celebrating military podcasters who use their platforms to share stories, 
                  promote their businesses, and find healing through the power of voice.
                </p>
                
                {/* Social Share Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <span className="text-sm text-muted-foreground">Share:</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShare('twitter')}
                    className="gap-2"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShare('facebook')}
                    className="gap-2"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShare('linkedin')}
                    className="gap-2"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                  {'share' in navigator && (
                    <Button 
                      variant="gold" 
                      size="sm" 
                      onClick={handleNativeShare}
                      className="gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-110" />
                  <img 
                    src={podcastDayLogo} 
                    alt="National Military Podcast Day" 
                    className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Is It Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-8">
                What is National Military Podcast Day?
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground text-center">
                <p className="text-lg leading-relaxed">
                  We want to celebrate the Military Podcasters using their platforms as a way to 
                  promote their business, share stories, or simply as a therapeutic way to speak 
                  what they have bottled up inside! We want to chisel out a day that recognizes 
                  these individuals.
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  <strong className="text-foreground">October 6, 2001</strong>, marked the beginning of 
                  Enduring Freedom in Afghanistan, and we would like to preface this day of remembrance 
                  with a day of celebration!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-4">
                    Why Celebrate This Day?
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Veterans often use podcasting as a therapeutic way of dealing with what they 
                    encountered in the military. We want to celebrate this since one of the best 
                    ways of dealing with PTSD is discussing it. We want to encourage veterans to 
                    start a podcast and just talk. We believe creating this day would help 
                    encourage this action!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* How to Celebrate Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4">
              How to Celebrate
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Here are some ways you can participate in National Military Podcast Day
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {celebrationIdeas.map((idea, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <idea.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{idea.title}</h3>
                    <p className="text-muted-foreground text-sm">{idea.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Hashtag CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
                Join the Conversation
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Subscribe to a new show and talk about it using
              </p>
              <div className="inline-flex items-center gap-2 bg-background border-2 border-primary px-6 py-3 rounded-full">
                <span className="text-2xl font-bold text-primary">#MilitaryPodcastDay</span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <Button 
                  variant="gold" 
                  size="lg" 
                  onClick={() => handleShare('twitter')}
                  className="gap-2"
                >
                  <Twitter className="w-5 h-5" />
                  Tweet Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                >
                  <a href="/network" className="gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Explore Podcasts
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Download Banner Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
              Download the Official Badge
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Add the National Military Podcast Day badge to your website or social media profiles
            </p>
            <div className="inline-block p-6 bg-muted rounded-2xl mb-6">
              <img 
                src={podcastDayLogo} 
                alt="National Military Podcast Day Badge" 
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>
            <div>
              <Button variant="gold" size="lg" asChild>
                <a href={podcastDayLogo} download="national-military-podcast-day.png">
                  Download Badge
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PodcastDay;

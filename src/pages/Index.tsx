import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { CategoriesPreview } from "@/components/home/CategoriesPreview";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CallToAction } from "@/components/home/CallToAction";
import { SEO } from "@/components/SEO";

const Index = () => {
  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Veteran Podcast Awards 2026',
    startDate: '2026-10-05',
    endDate: '2026-10-05',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://veteranpodcastawards.com/livestream'
    },
    description: 'The annual Veteran Podcast Awards ceremony celebrating military podcasters on National Military Podcast Day.',
    organizer: {
      '@type': 'Organization',
      name: 'Veteran Podcast Awards',
      url: 'https://veteranpodcastawards.com'
    },
    image: 'https://veteranpodcastawards.com/og-image.png'
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        canonicalUrl="/"
        structuredData={eventStructuredData}
      />
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <CategoriesPreview />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CallToAction } from "@/components/home/CallToAction";
import { FriendsOf } from "@/components/home/FriendsOf";
import { SEO } from "@/components/SEO";

const Index = () => {
  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Veteran Podcast Awards 2026',
    startDate: '2026-11-11',
    endDate: '2026-11-11',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://veteranpodcastawards.com/livestream'
    },
    description: 'The annual Veteran Podcast Awards ceremony celebrating military podcasters. Voting on October 5th, Awards Show on Veterans Day, November 11th.',
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
        <FriendsOf />
        <HowItWorks />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

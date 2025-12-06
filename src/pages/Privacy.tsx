import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you pre-register for updates, 
                submit a podcast for consideration, or contact us. This may include your name, email address, 
                and podcast RSS feed URL.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Send you updates about the Veteran Podcast Awards and National Military Podcast Day</li>
                <li>Process podcast submissions for our network directory</li>
                <li>Respond to your inquiries and requests</li>
                <li>Improve our services and website</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">3. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as required by law or to protect our rights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information. 
                However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">5. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us through our website.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;

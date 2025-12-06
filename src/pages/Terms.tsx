import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Veteran Podcast Awards website and services, you agree to be 
                bound by these Terms & Conditions. If you do not agree, please do not use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">2. Podcast Directory</h2>
              <p>
                The podcasts listed in our network directory are independently owned and operated by their 
                respective creators. The Veteran Podcast Awards, National Military Podcast Day, and affiliated 
                organizations do not claim ownership of any podcast content displayed on this website.
              </p>
              <p>
                Inclusion in our directory does not constitute endorsement of podcast content or views expressed therein.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">3. User Submissions</h2>
              <p>
                By submitting your podcast for inclusion in our directory, you represent that you have 
                the right to share this information and that it does not infringe on any third-party rights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">4. Intellectual Property</h2>
              <p>
                The Veteran Podcast Awards name, logo, and website content are protected by intellectual 
                property laws. You may not use our branding without prior written consent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">5. Limitation of Liability</h2>
              <p>
                We are not liable for any damages arising from your use of this website or reliance on 
                information provided herein. All content is provided "as is" without warranties of any kind.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">6. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the website 
                constitutes acceptance of updated terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-foreground">7. Contact</h2>
              <p>
                For questions regarding these Terms & Conditions, please contact us through our website.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;

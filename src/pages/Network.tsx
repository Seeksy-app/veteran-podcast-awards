import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PodcastGrid } from "@/components/podcasts/PodcastGrid";
import { PodcastSubmissionForm } from "@/components/podcasts/PodcastSubmissionForm";
import { PodcastDisclaimer } from "@/components/podcasts/PodcastDisclaimer";
import { Radio, Users, Headphones, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const NetworkPage = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/50 rounded-full px-4 py-2 mb-6">
              <Radio className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Podcast Network</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Veteran & Military</span>
              <br />
              <span className="text-gold-gradient">Podcast Network</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Discover the voices of those who served. Explore podcasts from veterans 
              sharing stories, insights, and perspectives that matter.
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mb-12">
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-primary font-bold">800+</p>
              <p className="text-sm text-muted-foreground">Podcasts</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-primary font-bold">10,000+</p>
              <p className="text-sm text-muted-foreground">Episodes</p>
            </div>
            <div className="text-center">
              <Headphones className="w-8 h-8 text-primary mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Millions of Listeners</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Info className="w-4 h-4 mr-2" />
                  Disclaimer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <PodcastDisclaimer />
              </DialogContent>
            </Dialog>

            <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Podcast
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <PodcastSubmissionForm onSuccess={() => setShowSubmitForm(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Podcast Grid with Search */}
          <PodcastGrid />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NetworkPage;

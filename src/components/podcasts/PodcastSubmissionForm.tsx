import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rss, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PodcastSubmissionForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rss_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("podcast_submissions").insert({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        rss_url: formData.rss_url.trim(),
      });

      if (error) throw error;

      toast({
        title: "Submission Received!",
        description: "Thank you! We'll review your podcast and get back to you.",
      });

      setFormData({ name: "", email: "", rss_url: "" });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center gap-2 bg-primary/20 border border-primary/50 rounded-full px-4 py-2 mb-4 mx-auto">
          <Rss className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Submit Your Podcast</span>
        </div>
        <CardTitle className="font-serif text-2xl text-foreground">
          Want to Add Your Podcast?
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          If you have a veteran or military-focused podcast, submit it for consideration in our network.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rss_url">Podcast RSS Feed URL</Label>
            <Input
              id="rss_url"
              type="url"
              placeholder="https://feeds.example.com/podcast"
              value={formData.rss_url}
              onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Podcast"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

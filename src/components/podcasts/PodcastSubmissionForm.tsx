import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rss, Send, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PodcastSubmissionFormProps {
  onSuccess?: () => void;
}

export const PodcastSubmissionForm = ({ onSuccess }: PodcastSubmissionFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState<"submit" | "create">("submit");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rss_url: "",
  });

  const handleSubmitOnly = async () => {
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

      setFormData({ name: "", email: "", password: "", rss_url: "" });
      onSuccess?.();
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

  const handleCreateAccount = async () => {
    if (!formData.password || formData.password.length < 6) {
      toast({
        title: "Password Required",
        description: "Please enter a password with at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.name.trim(),
            user_type: "podcaster",
          },
        },
      });

      if (authError) throw authError;

      // Also submit the podcast
      const { error: submitError } = await supabase.from("podcast_submissions").insert({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        rss_url: formData.rss_url.trim(),
      });

      if (submitError) {
        console.error("Podcast submission error:", submitError);
      }

      toast({
        title: "Account Created!",
        description: "Your account has been created and podcast submitted for review.",
      });

      setFormData({ name: "", email: "", password: "", rss_url: "" });
      onSuccess?.();
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Account Creation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitType === "create") {
      await handleCreateAccount();
    } else {
      await handleSubmitOnly();
    }
  };

  return (
    <div className="py-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center gap-2 bg-primary/20 border border-primary/50 rounded-full px-4 py-2 mb-4">
          <Rss className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Submit Your Podcast</span>
        </div>
        <h3 className="font-serif text-2xl text-foreground font-semibold">
          Want to Add Your Podcast?
        </h3>
        <p className="text-muted-foreground text-sm mt-2">
          If you have a veteran or military-focused podcast, submit it for consideration.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Submit Options */}
        <RadioGroup
          value={submitType}
          onValueChange={(value) => setSubmitType(value as "submit" | "create")}
          className="space-y-3 pt-2"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <RadioGroupItem value="submit" id="submit-only" />
            <Label htmlFor="submit-only" className="flex-1 cursor-pointer">
              <span className="font-medium">Submit Podcast Only</span>
              <p className="text-xs text-muted-foreground">Just submit your podcast for consideration</p>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <RadioGroupItem value="create" id="create-account" />
            <Label htmlFor="create-account" className="flex-1 cursor-pointer">
              <span className="font-medium">Submit & Create Account</span>
              <p className="text-xs text-muted-foreground">Get a creator dashboard with stats & promotional assets</p>
            </Label>
          </div>
        </RadioGroup>

        {submitType === "create" && (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="password">Create Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={submitType === "create"}
              minLength={6}
            />
          </div>
        )}

        <Button type="submit" className="w-full" variant="gold" disabled={isSubmitting}>
          {submitType === "create" ? (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Creating Account..." : "Submit & Create Account"}
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Podcast"}
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

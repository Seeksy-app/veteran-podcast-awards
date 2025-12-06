import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";

type ContactType = "sponsorship" | "general" | "nomination" | "partnership" | "media";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ContactType;
}

const formConfig: Record<ContactType, { title: string; description: string; subject: string }> = {
  sponsorship: {
    title: "Become a Sponsor",
    description: "Interested in sponsoring the Veteran Podcast Awards? Tell us about your organization and goals.",
    subject: "Sponsorship Inquiry",
  },
  general: {
    title: "Contact Us",
    description: "Have questions about the Veteran Podcast Awards? We'd love to hear from you.",
    subject: "General Inquiry",
  },
  nomination: {
    title: "Nominate a Podcast",
    description: "Know a veteran podcast that deserves recognition? Submit your nomination.",
    subject: "Podcast Nomination",
  },
  partnership: {
    title: "Partner With Us",
    description: "Interested in partnering with the Veteran Podcast Awards? Let's discuss opportunities.",
    subject: "Partnership Inquiry",
  },
  media: {
    title: "Media Inquiry",
    description: "Press and media inquiries for the Veteran Podcast Awards.",
    subject: "Media Inquiry",
  },
};

export const ContactFormDialog = ({ open, onOpenChange, type }: ContactFormDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [podcastUrl, setPodcastUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = formConfig[type];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store the inquiry in pre_registrations table with interested_in field
      const interestedIn = [type, organization, message];
      if (podcastUrl) interestedIn.push(`RSS/URL: ${podcastUrl}`);
      
      const { error } = await supabase.from("pre_registrations").insert({
        email,
        name,
        interested_in: interestedIn.filter(Boolean),
      });

      if (error) throw error;

      toast.success("Thank you! We'll be in touch soon.");
      onOpenChange(false);
      setName("");
      setEmail("");
      setOrganization("");
      setPodcastUrl("");
      setMessage("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {(type === "sponsorship" || type === "partnership" || type === "media") && (
            <div className="space-y-2">
              <Label htmlFor="organization">
                {type === "media" ? "Publication/Outlet" : "Organization"}
              </Label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder={type === "media" ? "Your publication" : "Company name"}
              />
            </div>
          )}

          {type === "nomination" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="podcast">Podcast Name</Label>
                <Input
                  id="podcast"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Name of the podcast"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="podcastUrl">RSS or Podcast URL (optional)</Label>
                <Input
                  id="podcastUrl"
                  value={podcastUrl}
                  onChange={(e) => setPodcastUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">
              {type === "nomination" ? "Why should this podcast be nominated?" : "Message"}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === "sponsorship"
                  ? "Tell us about your sponsorship goals..."
                  : type === "nomination"
                  ? "Share why this podcast deserves recognition..."
                  : "Your message..."
              }
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full" variant="gold" disabled={isSubmitting}>
            {isSubmitting ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Hook to manage contact form state
export const useContactForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formType, setFormType] = useState<ContactType>("general");

  const openForm = (type: ContactType) => {
    setFormType(type);
    setIsOpen(true);
  };

  return {
    isOpen,
    formType,
    setIsOpen,
    openForm,
  };
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255),
  name: z.string().trim().max(100).optional(),
});

export const PreRegistrationForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = emailSchema.safeParse({ email, name: name || undefined });
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Invalid input");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("pre_registrations")
        .insert({
          email: validation.data.email,
          name: validation.data.name || null,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already registered!");
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast.success("You're on the list! We'll notify you when registration opens.");
      }
    } catch (error) {
      console.error("Pre-registration error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center gap-3 bg-secondary/50 border border-primary/30 rounded-lg px-6 py-4">
        <CheckCircle className="w-6 h-6 text-primary" />
        <div>
          <p className="font-medium text-foreground">You're on the list!</p>
          <p className="text-sm text-muted-foreground">We'll notify you when 2026 registration opens.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <p className="text-sm text-muted-foreground mb-3 text-center">
        Get notified when 2026 registration opens
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          maxLength={255}
          className="flex-1 h-12 px-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button
          type="submit"
          variant="gold"
          size="lg"
          disabled={isLoading}
          className="h-12"
        >
          {isLoading ? (
            "Signing up..."
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Notify Me
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const hasRecoveryToken = useMemo(() => {
    const search = new URLSearchParams(window.location.search);
    return (
      window.location.hash.includes("access_token=") ||
      window.location.hash.includes("type=recovery") ||
      search.get("type") === "recovery"
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setHasSession(Boolean(data.session));
      setIsCheckingLink(false);
    };

    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setHasSession(Boolean(session));
      }

      setIsCheckingLink(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated. You can sign in now.");
      navigate("/auth", { replace: true });
    } catch {
      toast.error("Unable to update your password right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-muted-foreground">
        Validating reset link...
      </div>
    );
  }

  if (!hasSession && !hasRecoveryToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Invalid reset link</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Open the password reset link from your email, or request a new one from the login page.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link to="/auth">Back to login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold text-foreground">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your new password for this account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Updating password..." : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

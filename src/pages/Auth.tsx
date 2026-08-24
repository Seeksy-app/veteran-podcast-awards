import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/vpa-logo.png";
import { Eye, EyeOff, Mail, Lock, User, Mic, Heart, ArrowRight } from "lucide-react";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type UserType = "podcaster" | "fan";

// Rotating right-panel imagery: media, awards, community
const SLIDES = [
  { src: "https://images.unsplash.com/photo-1598743400863-0201c7e1445b?w=1600&q=80" }, // ON AIR studio
  { src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80" }, // confetti celebration
  { src: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1600&q=80" }, // crowd, stage lights
  { src: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600&q=80" }, // studio microphone
];

const QUOTES = [
  {
    text: "The most powerful person in the world is the storyteller.",
    author: "Steve Jobs",
    role: "Apple co-founder",
  },
  {
    text: "Podcasting is the most intimate form of media because it lives inside your head.",
    author: "Marco Arment",
    role: "Overcast creator",
  },
  {
    text: "In a world of algorithms, hashtags, and followers, know the true importance of human connection.",
    author: "Tim Salau",
    role: "Tech leader",
  },
  {
    text: "Courage is not the absence of fear, but rather the judgment that something else is more important.",
    author: "Ambrose Redmoon",
    role: "Writer",
  },
];

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showResendVerify, setShowResendVerify] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; userType?: string }>({});

  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Surface OAuth errors that providers/Supabase send back via URL params
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(window.location.search);
    const errDesc =
      hashParams.get("error_description") ||
      queryParams.get("error_description") ||
      hashParams.get("error") ||
      queryParams.get("error");
    if (errDesc) {
      toast.error(`Sign-in failed: ${decodeURIComponent(errDesc).replace(/\+/g, " ")}`);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const { signIn, signUp, requestPasswordReset, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "signup");
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user && user.email_confirmed_at) {
      const returnTo = searchParams.get("returnTo");
      const from = (location.state as { from?: string })?.from;
      const target = returnTo ? decodeURIComponent(returnTo) : from || "/";
      navigate(target, { replace: true });
    }
  }, [user, loading, navigate, location, searchParams]);

  useEffect(() => {
    if (searchParams.get("intent") === "voter") {
      setIsLogin(false);
      setUserType("fan");
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; userType?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin && !userType) {
      newErrors.userType = "Please select whether you're a podcaster or fan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors((prev) => ({ ...prev, email: emailResult.error.errors[0].message }));
      toast.error("Enter your email first to reset your password.");
      return;
    }

    setIsSendingReset(true);
    try {
      const { error } = await requestPasswordReset(email);
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password reset email sent. Check your inbox.");
    } catch {
      toast.error("Unable to send password reset email right now.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Enter your email address first.");
      return;
    }
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email resent. Check your inbox.");
      }
    } catch {
      toast.error("Unable to resend verification email right now.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setShowResendVerify(true);
            toast.error("Please verify your email first.");
          } else if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
        }
      } else {
        const { error } = await signUp(email, password, fullName, userType!);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Try logging in instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          await supabase.from("podcast_contacts").upsert(
            {
              email,
              name: fullName || email.split("@")[0],
              source: "Website Signup",
              status: "registered",
              lists: ["Registered Users"],
              tags: [userType || "fan"],
            },
            { onConflict: "email", ignoreDuplicates: true }
          );
          setShowVerify(true);
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ─── Left: Form ─── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 bg-background">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <a href="/" className="inline-flex items-center gap-3 mb-8">
            <img src={logo} alt="VPA" className="h-10 w-10" />
            <span className="font-serif text-lg font-bold text-primary">Veteran Podcast Awards</span>
          </a>

          {showVerify ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Check your email</h1>
              <p className="text-muted-foreground mb-2">
                We sent a verification link to
              </p>
              <p className="text-foreground font-medium mb-6">{email}</p>
              <p className="text-sm text-muted-foreground mb-8">
                Click the link in the email to verify your account, then come back here to sign in.
              </p>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="text-sm text-primary font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResending ? "Sending..." : "Didn't get it? Resend verification email"}
                </button>
                <button
                  onClick={() => {
                    setShowVerify(false);
                    setIsLogin(true);
                    setPassword("");
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to sign in
                </button>
              </div>
            </div>
          ) : (
          <>
          {/* Title */}
          <div className="mb-10">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Sign in to your VPA account" : "Join the Veteran Podcast Awards community"}
            </p>
          </div>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: "linkedin_oidc",
                  options: { redirectTo: `${window.location.origin}/dashboard` },
                });
                if (error) toast.error(`LinkedIn sign-in failed: ${error.message}`);
              }}
            >
              <svg className="w-5 h-5 mr-3 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Continue with LinkedIn
            </Button>
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: "spotify",
                  options: { redirectTo: `${window.location.origin}/dashboard` },
                });
                if (error) toast.error(`Spotify sign-in failed: ${error.message}`);
              }}
            >
              <svg className="w-5 h-5 mr-3 fill-[#1DB954]" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Continue with Spotify
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">or</span>
            </div>
          </div>

          {showResendVerify && (
            <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email not verified</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check your inbox for the verification link, or resend it below.
                  </p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="mt-2 text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResending ? "Sending..." : "Resend verification email"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setUserType("podcaster");
                        setErrors((prev) => ({ ...prev, userType: undefined }));
                      }}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        userType === "podcaster"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      <Mic className="w-6 h-6" />
                      <span className="text-sm font-medium">Podcaster</span>
                      <span className="text-xs text-muted-foreground text-center">I have a podcast</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserType("fan");
                        setErrors((prev) => ({ ...prev, userType: undefined }));
                      }}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        userType === "fan"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      <Heart className="w-6 h-6" />
                      <span className="text-sm font-medium">Fan</span>
                      <span className="text-xs text-muted-foreground text-center">Follow & vote</span>
                    </button>
                  </div>
                  {errors.userType && <p className="text-sm text-destructive">{errors.userType}</p>}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="you@example.com"
                  className={`pl-10 h-12 ${errors.email ? "border-destructive" : ""}`}
                  required
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Your password"
                  className={`pl-10 pr-10 h-12 ${errors.password ? "border-destructive" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSendingReset}
                  className="text-sm text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSendingReset ? "Sending reset..." : "Forgot password?"}
                </button>
              </div>
            )}

            <Button type="submit" variant="gold" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
          </>
          )}
        </div>
      </div>

      {/* ─── Right: Rotating imagery + Quote ─── */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover brightness-[1.2] transition-opacity duration-[1500ms] ease-in-out ${
              i === slideIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-12 pb-16 w-full">
          <div className="max-w-lg">
            <div className="text-primary text-5xl font-serif mb-4 leading-none">&ldquo;</div>
            <blockquote className="font-serif text-2xl text-white italic leading-relaxed mb-6 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
              {quote.text}
            </blockquote>
            <div>
              <p className="text-primary font-semibold [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">{quote.author}</p>
              <p className="text-white/80 text-sm [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">{quote.role}</p>
            </div>
          </div>
          {/* Slide dots */}
          <div className="absolute bottom-6 right-8 flex gap-2">
            {SLIDES.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                  i === slideIndex ? "bg-primary" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/vpa-logo.png";
import { Eye, EyeOff, Mail, Lock, User, Mic, Heart } from "lucide-react";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type UserType = "podcaster" | "fan";

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
  const [errors, setErrors] = useState<{ email?: string; password?: string; userType?: string }>({});

  const { signIn, signUp, requestPasswordReset, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "signup");
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
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
          toast.success("Account created! You can now sign in.");
          setIsLogin(true);
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="VPA Logo" className="w-20 h-20 mb-4 glow-gold rounded-full" />
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isLogin ? "Sign in to your account" : "Join the Veteran Podcast Awards"}
            </p>
          </div>

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
                      className="pl-10"
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
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
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
                  placeholder="••••••••"
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
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

            <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
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

          <div className="mt-6 border-t border-border pt-6 text-center">
            <a href="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

import * as React from "react";
import { useAuth } from "../../hooks/useAuth";
import { client } from "@/lib/appwrite";
import { Account } from "appwrite";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Github, Globe, Chrome, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LoginModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ isOpen, onOpenChange }: LoginModalProps) {
  const { signInWithProvider, checkAuth } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);

  const handleProviderLogin = async (provider: 'google' | 'github') => {
    setLoadingProvider(provider);
    setError("");
    try {
      await signInWithProvider(provider);
    } catch {
      setLoadingProvider(null);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const account = new Account(client);
      await account.createEmailPasswordSession({ email, password });
      await checkAuth();
      toast.success("Signed in successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Sign in failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[400px] md:max-w-[800px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="flex flex-col md:flex-row min-h-0 md:h-[600px]">
          {/* Left Side: Branding/Visual - Hidden on Mobile */}
          <div className="hidden md:flex relative w-1/2 bg-primary items-center justify-center p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
            
            {/* Abstract Premium Visuals */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/10 blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
                 <Globe className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-primary-foreground tracking-tight mb-2">Welcome Back</h2>
                <p className="text-primary-foreground/70 text-sm max-w-[240px] leading-relaxed">
                  Access your synchronized workspace and cloud resources across all your devices.
                </p>
              </div>
              
              <div className="pt-8 grid grid-cols-2 gap-4 w-full opacity-50">
                <div className="h-2 rounded-full bg-white/20" />
                <div className="h-2 rounded-full bg-white/20" />
                <div className="h-2 rounded-full bg-white/20 w-1/2" />
                <div className="h-2 rounded-full bg-white/20 w-3/4" />
              </div>
            </div>
            
            <div className="absolute bottom-8 left-8 flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
               <span className="text-[10px] font-medium text-primary-foreground/40 uppercase tracking-widest">Antigravity Identity</span>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="flex-1 flex flex-col justify-center p-6 xs:p-8 md:p-12 bg-card max-h-[90vh] overflow-y-auto">
            <div className="mx-auto w-full max-w-[320px] space-y-5">
              <div className="space-y-1.5 text-center md:text-left">
                <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight">Sign in</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Continue with social account or email
                </DialogDescription>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                  {error}
                </div>
              )}

              {/* OAuth Providers */}
              <div className="grid grid-cols-2 gap-2.5">
                <Button 
                  variant="outline" 
                  className="w-full h-10 border-border/60 hover:bg-muted hover:border-border transition-all flex items-center justify-center gap-2 font-medium text-xs rounded-xl"
                  onClick={() => handleProviderLogin('google')}
                  disabled={loadingProvider !== null || loading}
                >
                  {loadingProvider === 'google' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Chrome className="w-4 h-4 text-primary" />
                  )}
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-10 border-border/60 hover:bg-muted hover:border-border transition-all flex items-center justify-center gap-2 font-medium text-xs rounded-xl"
                  onClick={() => handleProviderLogin('github')}
                  disabled={loadingProvider !== null || loading}
                >
                  {loadingProvider === 'github' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Github className="w-4 h-4" />
                  )}
                  GitHub
                </Button>
              </div>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-border/40"></div>
                <span className="flex-shrink mx-3 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Or with password</span>
                <div className="flex-grow border-t border-border/40"></div>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailPasswordLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="modal-email" className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Email address
                  </Label>
                  <Input 
                    id="modal-email" 
                    placeholder="name@example.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 bg-transparent border-border/60 focus:ring-primary/20 text-sm rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="modal-password" className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Password
                  </Label>
                  <Input 
                    id="modal-password" 
                    placeholder="••••••••" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-9 bg-transparent border-border/60 focus:ring-primary/20 text-sm rounded-lg"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 font-semibold text-xs rounded-xl" 
                  disabled={loading || loadingProvider !== null || !email || !password}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? "Signing in…" : "Sign In"}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  onClick={() => onOpenChange(false)}
                  className="font-semibold text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import * as React from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Github, Globe, Chrome } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ isOpen, onOpenChange }: LoginModalProps) {
  const { signInWithProvider } = useAuth();
  const [email, setEmail] = React.useState("");

  const handleProviderLogin = async (provider: any) => {
    await signInWithProvider(provider);
    onOpenChange(false);
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
            <div className="mx-auto w-full max-w-[320px] space-y-6">
              <div className="space-y-1.5 text-center md:text-left">
                <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight">Sign in</DialogTitle>
                <DialogDescription className="text-sm">
                  Choose your preferred authentication provider.
                </DialogDescription>
              </div>

              <div className="grid gap-2.5">
                <Button 
                  variant="outline" 
                  className="w-full h-10 border-border/60 hover:bg-muted hover:border-border transition-all flex items-center justify-center gap-3 font-medium text-xs rounded-xl"
                  onClick={() => handleProviderLogin('google')}
                >
                  <Chrome className="w-4 h-4 text-primary" />
                  Continue with Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-10 border-border/60 hover:bg-muted hover:border-border transition-all flex items-center justify-center gap-3 font-medium text-xs rounded-xl"
                  onClick={() => handleProviderLogin('github')}
                >
                  <Github className="w-4 h-4" />
                  Continue with GitHub
                </Button>
              </div>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-border/40"></div>
                <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Or</span>
                <div className="flex-grow border-t border-border/40"></div>
              </div>

              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Email address</Label>
                  <Input 
                    id="email" 
                    placeholder="name@example.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 bg-transparent border-border/60 focus:ring-primary/20 text-sm rounded-lg"
                  />
                </div>
                <Button className="w-full h-10 font-semibold text-xs rounded-xl" disabled={!email}>
                  Continue with Email
                </Button>
              </div>

              <p className="text-center text-[10px] leading-relaxed text-muted-foreground px-2">
                By clicking continue, you agree to our{" "}
                <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">
                  Privacy Policy
                </a>.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

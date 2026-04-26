'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card p-10 shadow-2xl transition-all hover:shadow-primary/5">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 animate-in fade-in zoom-in duration-500">
            <AlertCircle className="h-10 w-10" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Authentication Error</h1>
            <p className="text-muted-foreground">
              We couldn't sign you in. This might be due to an expired session or misconfigured provider settings.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground border border-border/50">
            <p className="font-semibold text-foreground mb-1">Common troubleshooting steps:</p>
            <ul className="list-inside list-disc space-y-1 opacity-80">
              <li>Check if third-party cookies are enabled</li>
              <li>Ensure you are using a supported browser</li>
              <li>Verify that the OAuth provider is correctly configured in the dashboard</li>
            </ul>
          </div>

          <div className="grid gap-3">
            <Link 
              href="/?login=true" 
              className={cn(
                buttonVariants({ variant: 'default' }), 
                "w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
              )}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Signing In Again
            </Link>
            
            <Link 
              href="/" 
              className={cn(
                buttonVariants({ variant: 'outline' }), 
                "w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center cursor-pointer border-border/60 hover:bg-muted/50 transition-all active:scale-[0.98]"
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold opacity-50">
            Error Code: AUTH_CALLBACK_FAILURE
          </p>
        </div>
      </div>
    </div>
  );
}

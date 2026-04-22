import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Globe, UserCheck, Database, FileText, ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms of Service | Vikas Dhavande',
  description: 'Learn about how we handle your data, our OAuth integrations, and our terms of service.',
  openGraph: {
    title: 'Privacy Policy & Terms of Service | Vikas Dhavande',
    description: 'Detailed information on data collection, OAuth providers, and user rights.',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pb-20 pt-24">
      <div className="container mx-auto max-w-4xl px-6">
        <Link 
          href="/" 
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="space-y-4 mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Privacy Policy & Terms of Service</h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Last updated: April 20, 2026. This document explains how we collect, use, and protect your personal information through our OAuth integrations and general services.
          </p>
        </div>

        <div className="grid gap-12">
          {/* OAuth Integration Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Globe className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold">OAuth Authentication</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We use secure OAuth 2.0 authentication to allow you to sign in using your existing accounts from trusted providers like <strong>Google, GitHub, Facebook, and Microsoft</strong>.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google:</strong> Used for secure sign-in and optional integration with Google Drive resources.</li>
                <li><strong>GitHub:</strong> Used for developer-focused authentication and profile synchronization.</li>
                <li><strong>Data Requested:</strong> We only request access to your basic profile information (name, email, and avatar) and specific scopes required for the services you choose to enable.</li>
                <li><strong>Token Security:</strong> We do not store your provider passwords. We only store encrypted access and refresh tokens to maintain your session.</li>
              </ul>
            </div>
          </section>

          {/* Data Collection Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <UserCheck className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold">Data Collection & Consent</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Your privacy is paramount. We collect data only when explicitly provided by you or your authentication provider with your consent.
              </p>
              <div className="grid md:grid-cols-2 gap-6 pt-2">
                <div className="p-5 rounded-2xl border border-border/50 bg-card shadow-sm">
                  <h3 className="font-bold text-foreground mb-2">Explicit Consent</h3>
                  <p className="text-sm">By clicking "Sign In", you consent to our retrieval of your profile data as disclosed by the provider's authorization screen.</p>
                </div>
                <div className="p-5 rounded-2xl border border-border/50 bg-card shadow-sm">
                  <h3 className="font-bold text-foreground mb-2">Usage Data</h3>
                  <p className="text-sm">We use Vercel Analytics to track anonymized usage patterns to improve our service performance and user experience.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Storage Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Database className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold">Storage & Security</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We leverage industry-standard infrastructure to ensure your data remains secure and private.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Database:</strong> All user profiles are stored in Supabase (PostgreSQL) with Row-Level Security (RLS) enforced at the database level.</li>
                <li><strong>Encryption:</strong> Data is encrypted at rest and during transit using TLS 1.3.</li>
                <li><strong>Location:</strong> Our infrastructure is hosted on Vercel and Supabase global edge networks, primarily in secure AWS data centers.</li>
              </ul>
            </div>
          </section>

          {/* User Rights Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold">Your Rights</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Under GDPR, CCPA, and other privacy regulations, you have full control over your personal data:
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 rounded-full border border-border bg-muted/50 text-xs font-medium">Right to Access</span>
                <span className="px-3 py-1.5 rounded-full border border-border bg-muted/50 text-xs font-medium">Right to Deletion</span>
                <span className="px-3 py-1.5 rounded-full border border-border bg-muted/50 text-xs font-medium">Data Portability</span>
                <span className="px-3 py-1.5 rounded-full border border-border bg-muted/50 text-xs font-medium">Revoke Consent</span>
              </div>
              <p className="pt-2">
                You can delete your account and all associated data at any time via the <strong>Dashboard > Account</strong> settings. For any data-related requests, please contact us at <a href="mailto:contact@designali.in" className="text-primary hover:underline">contact@designali.in</a>.
              </p>
            </div>
          </section>

          {/* Terms Section */}
          <section className="pt-8 border-t border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold">Terms of Service</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                By accessing this website, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
              </p>
              <p>
                The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-muted/30 border border-border/50 text-center">
          <p className="text-sm text-muted-foreground italic">
            © 2026 Vikas Dhavande. All rights reserved. This policy is subject to change. Continued use of our services constitutes acceptance of updated terms.
          </p>
        </div>
      </div>
    </div>
  );
}

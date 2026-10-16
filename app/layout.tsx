import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "../src/components/theme-provider";
import { AuthProvider } from "../src/hooks/useAuth";
import Header from "../src/components/layout/Header";
import Footer from "../src/components/layout/Footer";
import { Toaster } from "../src/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@/components/ui/tooltip";
import AnalyticsTracker from "../src/components/analytics/AnalyticsTracker";
import { AppDockNav } from "../src/components/navigation/AppDockNav";
import { AuthModalProvider } from "../src/contexts/AuthModalContext";
import { AuthModal } from "../src/components/auth/AuthModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vikas Dhavande - Portfolio",
  description: "Developer, Designer, and Tech Enthusiast",
  other: {
    "mcp-actions": "/mcp-actions.json",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <AuthModalProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                <div className="flex min-h-screen flex-col font-sans">
                  <Header />
                  <main className="flex-1 pb-20 md:pb-28">
                    {children}
                  </main>
                  <Footer />
                  <AppDockNav />
                </div>
                <AuthModal />
                <Toaster position="top-center" richColors />
                <SpeedInsights />
                <Analytics />
                <Suspense fallback={null}>
                  <AnalyticsTracker />
                </Suspense>
              </TooltipProvider>
            </ThemeProvider>
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

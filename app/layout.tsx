import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../src/components/theme-provider";
import { AuthProvider } from "../src/hooks/useAuth";
import Header from "../src/components/layout/Header";
import Footer from "../src/components/layout/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vikas Dhavande - Portfolio",
  description: "Developer, Designer, and Tech Enthusiast",
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col font-sans">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <SpeedInsights />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

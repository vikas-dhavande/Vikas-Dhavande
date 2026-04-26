import { redirect } from 'next/navigation';
import FloatingIconsHeroDemo from "../src/components/demo-floating-icons";
import WorkspaceWelcomeDemo from "../src/components/WorkspaceWelcomeDemo";
import { VideoList } from "../src/components/VideoList";
import { Testimonials } from "../src/components/Testimonials";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  // OAuth callback fallback: Supabase may redirect to Site URL (/) instead of
  // /auth/callback when the redirectTo URL isn't in the allowed list.
  // Forward the code to the real callback handler transparently.
  if (params.code) {
    const qs = new URLSearchParams();
    qs.set('code', params.code as string);
    if (params.next) qs.set('next', params.next as string);
    redirect(`/auth/callback?${qs.toString()}`);
  }

  return (
    <div className="w-full bg-background flex flex-col items-center justify-start pb-16 gap-16">
      <FloatingIconsHeroDemo />
      <Testimonials />
      <WorkspaceWelcomeDemo />
      <VideoList />
    </div>
  );
}


import FloatingIconsHeroDemo from "../src/components/demo-floating-icons";
import WorkspaceWelcomeDemo from "../src/components/WorkspaceWelcomeDemo";
import { VideoList } from "../src/components/VideoList";
import { Testimonials } from "../src/components/Testimonials";

export default function Home() {
  return (
    <div className="w-full bg-background flex flex-col items-center justify-start pb-16 gap-16">
      <FloatingIconsHeroDemo />
      <Testimonials />
      <WorkspaceWelcomeDemo />
      <VideoList />
    </div>
  );
}

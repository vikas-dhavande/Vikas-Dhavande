'use client';

import * as React from "react"; 
import { WorkspaceWelcome, type ActionItem } from "@/components/ui/welcome"; 
import { Scissors, Video, Signal } from "lucide-react"; 
import { useAuth } from "@/hooks/useAuth";
import { HairlineAccent } from "@/components/ui/hairline-accent";
 
const WorkspaceWelcomeDemo = () => { 
  const { user } = useAuth();
  
  // Define the action buttons with icons and handlers 
  const actions: ActionItem[] = [ 
    { 
      icon: <Scissors className="h-4 w-4 text-purple-500" />, 
      label: "Create Project", 
      onClick: () => alert("Create Project clicked!"), 
    }, 
    { 
      icon: <Video className="h-4 w-4 text-red-500" />, 
      label: "Record Video", 
      onClick: () => alert("Record Video clicked!"), 
    }, 
    { 
      icon: <Signal className="h-4 w-4 text-blue-500" />, 
      label: "Go Live", 
      isBeta: true, 
      onClick: () => alert("Go Live clicked!"), 
    }, 
  ]; 
 
  // Handler for the video play action 
  const handlePlayVideo = () => { 
    console.log("Playing video: https://www.youtube.com/watch?v=dQw4w9WgXcQ"); 
    alert("Play Video clicked! Check the console for the video link."); 
  }; 
 
  return ( 
    <div className="flex flex-col h-full w-full items-center justify-center bg-background p-4 gap-6 max-w-4xl mx-auto">
      {/* 3D Isometric Terminal Accent Bar */}
      <div className="w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <HairlineAccent figure="terminal" size="medium" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                Developer Command &amp; Workspace
              </h3>
              <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                active
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              Reactive toolchains, cloud file operations, and integrated telemetry
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>idle · 60fps</span>
        </div>
      </div>

      <WorkspaceWelcome 
        userName={user?.name || "Ravi Katiyar"} 
        actions={actions} 
        videoThumbnail="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
        videoTitle="Welcome to the Platform" 
        videoDescription="Learn about all features in less than 2 minutes!" 
        onPlayVideo={handlePlayVideo} 
      /> 
    </div> 
  ); 
}; 
 
export default WorkspaceWelcomeDemo; 

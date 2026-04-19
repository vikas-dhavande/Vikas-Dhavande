'use client';

import * as React from "react"; 
import { WorkspaceWelcome, type ActionItem } from "@/components/ui/welcome"; 
import { Scissors, Video, Signal } from "lucide-react"; 
import { useAuth } from "@/hooks/useAuth";
 
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
    // In a real app, you would open a modal or navigate to a video player 
    // For this demo, we'll just log to the console 
    console.log("Playing video: https://www.youtube.com/watch?v=dQw4w9WgXcQ"); 
    alert("Play Video clicked! Check the console for the video link."); 
  }; 
 
  return ( 
    <div className="flex h-full w-full items-center justify-center bg-background p-4"> 
      <WorkspaceWelcome 
        userName={user?.name || "Ravi Katiyar"} 
        actions={actions} 
        videoThumbnail="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" // Example thumbnail 
        videoTitle="Welcome to VEED.IO" 
        videoDescription="Learn about VEED in less than 2 minutes!" 
        onPlayVideo={handlePlayVideo} 
      /> 
    </div> 
  ); 
}; 
 
export default WorkspaceWelcomeDemo; 

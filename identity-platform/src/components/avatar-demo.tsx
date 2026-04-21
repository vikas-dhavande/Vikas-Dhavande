import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";

function Component() {
  return (
    <div className="relative inline-flex">
      <Avatar>
        <AvatarImage 
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
          alt="Kelly King" 
          referrerPolicy="no-referrer"
        />
        <AvatarFallback>KK</AvatarFallback>
      </Avatar>
      <span className="absolute -end-1 -top-1 rounded-full bg-white ring-1 ring-white">
        <span className="sr-only">Verified</span>
        <BadgeCheck className="text-primary fill-blue-50 h-5 w-5" />
      </span>
    </div>
  );
}

export { Component as AvatarDemo };

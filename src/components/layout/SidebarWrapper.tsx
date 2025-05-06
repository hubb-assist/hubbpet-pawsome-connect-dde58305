
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarWrapperProps {
  children: React.ReactNode;
}

const SidebarWrapper = ({ children }: SidebarWrapperProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cn(
      "min-h-screen bg-hubbpet-primary text-white transition-all duration-300",
      isExpanded ? "w-64" : "w-20"
    )}>
      <div className="flex items-center h-16 px-4">
        <div className={cn("flex items-center justify-center w-full", !isExpanded && "justify-center")}>
          {isExpanded ? (
            <div className="logo-container">
              <img src="https://sq360.com.br/logo-hubb-novo/hubb_pet_logo.png" alt="HubbPet" />
            </div>
          ) : (
            <div className="icon-container">
              <img src="https://sq360.com.br/logo-hubb-novo/hubb_pet_icon.png" alt="HubbPet Icon" />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end pr-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white hover:bg-sidebar-accent">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="mt-4 space-y-2 px-3">
        {children}
      </div>
    </div>
  );
};

export default SidebarWrapper;

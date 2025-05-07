
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarWrapperProps {
  children: React.ReactNode;
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const SidebarWrapper = ({ children, isExpanded, toggleSidebar }: SidebarWrapperProps) => {
  // O sidebar tem fundo escuro, então usamos o logo branco (claro)
  const logoUrl = "https://sq360.com.br/logo-hubb-novo/hubb_pet_logo.png";
  const iconUrl = "https://sq360.com.br/logo-hubb-novo/hubb_pet_icon.png";

  return (
    <div className={cn(
      "min-h-screen bg-hubbpet-primary text-white transition-all duration-300",
      isExpanded ? "w-64" : "w-20"
    )}>
      <div className="flex items-center h-16 px-4">
        <div className={cn("flex items-center justify-center w-full", !isExpanded && "justify-center")}>
          {isExpanded ? (
            <div className="logo-container">
              <img src={logoUrl} alt="HubbPet" className="max-h-10" />
            </div>
          ) : (
            <div className="icon-container">
              <img src={iconUrl} alt="HubbPet Icon" className="max-h-10" />
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

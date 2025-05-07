
import React from 'react';
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
      isExpanded ? "w-64" : "w-16"
    )}>
      <div className="flex flex-col items-center">
        <div className={cn("flex items-center w-full py-4",
          isExpanded ? "justify-start px-6" : "justify-center"
        )}>
          {isExpanded ? (
            <div className="logo-container">
              <img src={logoUrl} alt="HubbPet" className="max-h-8" />
            </div>
          ) : (
            <div className="icon-container flex justify-center">
              <img src={iconUrl} alt="HubbPet Icon" className="max-h-8" />
            </div>
          )}
        </div>
        <div className="w-full flex justify-center py-2 border-b border-sidebar-accent">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="text-white hover:bg-sidebar-accent h-8 w-8 p-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="mt-2 flex flex-col items-center space-y-1">
        {children}
      </div>
    </div>
  );
};

export default SidebarWrapper;

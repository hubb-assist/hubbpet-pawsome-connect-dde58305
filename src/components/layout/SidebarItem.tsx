
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  title: string;
  href: string;
  isActive?: boolean;
  isExpanded: boolean;
}

const SidebarItem = ({ icon: Icon, title, href, isActive = false, isExpanded }: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center justify-center w-full py-2",
        isActive ? "bg-sidebar-accent text-white" : "text-white hover:bg-sidebar-accent hover:text-white",
        isExpanded ? "px-6" : "px-0"
      )}
    >
      <div className={cn("flex items-center", isExpanded ? "w-full" : "w-auto")}>
        <div className="flex justify-center items-center w-8">
          <Icon className="h-5 w-5" />
        </div>
        {isExpanded && <span className="ml-3">{title}</span>}
      </div>
    </Link>
  );
};

export default SidebarItem;

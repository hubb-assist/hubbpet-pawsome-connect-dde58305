
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
        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-sidebar-accent text-white" : "text-white hover:bg-sidebar-accent hover:text-white",
        !isExpanded && "justify-center px-2"
      )}
    >
      <Icon className={cn("h-5 w-5", isExpanded && "mr-2")} />
      {isExpanded && <span>{title}</span>}
    </Link>
  );
};

export default SidebarItem;

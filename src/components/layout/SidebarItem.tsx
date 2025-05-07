
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  title: string;
  href: string;
  isActive: boolean;
  isExpanded: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  title,
  href,
  isActive,
  isExpanded
}) => {
  const navigate = useNavigate();

  return (
    <li
      className={`
        flex items-center p-2 rounded-md cursor-pointer transition-colors
        ${isActive ? 'bg-[#2D113F] text-white' : 'text-gray-600 hover:bg-gray-100'}
      `}
      onClick={() => navigate(href)}
    >
      <div className={`
        flex items-center justify-center 
        ${!isExpanded ? 'mx-auto p-1.5' : ''}
      `}>
        <Icon size={20} />
      </div>
      
      {isExpanded && (
        <span className="ml-3 text-sm font-medium">{title}</span>
      )}
    </li>
  );
};

export default SidebarItem;

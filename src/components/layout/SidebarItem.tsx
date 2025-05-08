
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  title: string;
  href: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick?: () => void;
  onExpandClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  title,
  href,
  isActive,
  isExpanded,
  onClick,
  onExpandClick
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isExpanded && onExpandClick) {
      onExpandClick();
      return;
    }
    
    if (onClick) {
      onClick();
    } else {
      console.log(`Navegando para: ${href}`);
      navigate(href);
    }
  };

  return (
    <li
      className={`
        flex items-center p-2 rounded-md cursor-pointer transition-colors
        ${isActive ? 'bg-[#2D113F] text-white' : 'text-white hover:bg-sidebar-accent'}
      `}
      onClick={handleClick}
    >
      <div className={`
        flex items-center
        ${!isExpanded ? 'mx-auto justify-center' : 'mr-3'}
      `}>
        <Icon size={20} />
      </div>
      
      {isExpanded && (
        <span className="text-sm font-medium text-[15px]">{title}</span>
      )}
    </li>
  );
};

export default SidebarItem;


import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Stethoscope, 
  Calendar, 
  ClipboardList
} from 'lucide-react';

import SidebarWrapper from './SidebarWrapper';
import SidebarItem from './SidebarItem';

type VeterinarySidebarProps = {
  closeSidebar?: () => void;
}

const VeterinarySidebar = ({ closeSidebar = () => {} }: VeterinarySidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { 
      path: '/vet', 
      icon: LayoutDashboard, 
      text: 'Dashboard' 
    },
    { 
      path: '/vet/perfil', 
      icon: User, 
      text: 'Meu Perfil' 
    },
    { 
      path: '/vet/services', 
      icon: Stethoscope, 
      text: 'Serviços' 
    },
    { 
      path: '/vet/agenda', 
      icon: Calendar, 
      text: 'Disponibilidade' 
    },
    { 
      path: '/vet/agendamentos', 
      icon: ClipboardList, 
      text: 'Agendamentos' 
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <SidebarWrapper isExpanded={isExpanded} toggleSidebar={toggleSidebar}>
      <div className="space-y-1">
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            title={item.text}
            href={item.path}
            isActive={isActive(item.path)}
            isExpanded={isExpanded}
            onClick={() => handleNavigate(item.path)}
          />
        ))}
      </div>
    </SidebarWrapper>
  );
};

export default VeterinarySidebar;

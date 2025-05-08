
import React from 'react';
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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { 
      path: '/vet', 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      text: 'Dashboard' 
    },
    { 
      path: '/vet/perfil', 
      icon: <User className="h-5 w-5" />, 
      text: 'Meu Perfil' 
    },
    { 
      path: '/vet/services', 
      icon: <Stethoscope className="h-5 w-5" />, 
      text: 'Serviços' 
    },
    { 
      path: '/vet/agenda', 
      icon: <Calendar className="h-5 w-5" />, 
      text: 'Disponibilidade' 
    },
    { 
      path: '/vet/agendamentos', 
      icon: <ClipboardList className="h-5 w-5" />, 
      text: 'Agendamentos' 
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <SidebarWrapper>
      <div className="space-y-1">
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            active={isActive(item.path)}
            onClick={() => handleNavigate(item.path)}
          >
            {item.text}
          </SidebarItem>
        ))}
      </div>
    </SidebarWrapper>
  );
};

export default VeterinarySidebar;


import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Calendar, Settings, User, BookOpen } from "lucide-react";
import SidebarWrapper from './SidebarWrapper';
import SidebarItem from './SidebarItem';

const VeterinarySidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const menuItems = [
    { icon: Home, title: 'Dashboard', href: '/vet' },
    { icon: Calendar, title: 'Agenda', href: '/vet/agenda' },
    { icon: BookOpen, title: 'Meus Serviços', href: '/vet/services' },
    { icon: User, title: 'Meu Perfil', href: '/vet/perfil' },
    { icon: Settings, title: 'Configurações', href: '/vet/settings' },
  ];

  return (
    <SidebarWrapper isExpanded={isExpanded} toggleSidebar={toggleSidebar}>
      {menuItems.map((item) => (
        <SidebarItem
          key={item.href}
          icon={item.icon}
          title={item.title}
          href={item.href}
          isActive={location.pathname === item.href}
          isExpanded={isExpanded}
        />
      ))}
    </SidebarWrapper>
  );
};

export default VeterinarySidebar;

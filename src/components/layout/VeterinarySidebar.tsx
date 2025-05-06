
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Calendar, Settings, User } from "lucide-react";
import SidebarWrapper from './SidebarWrapper';
import SidebarItem from './SidebarItem';

const VeterinarySidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    { icon: Home, title: 'Dashboard', href: '/vet' },
    { icon: Calendar, title: 'Agendamentos', href: '/vet/appointments' },
    { icon: User, title: 'Meus Serviços', href: '/vet/services' },
    { icon: Settings, title: 'Configurações', href: '/vet/settings' },
  ];

  return (
    <SidebarWrapper>
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

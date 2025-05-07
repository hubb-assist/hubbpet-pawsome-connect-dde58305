
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Search, Calendar, User, Settings } from "lucide-react";
import SidebarWrapper from './SidebarWrapper';
import SidebarItem from './SidebarItem';

const TutorSidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const menuItems = [
    { icon: Home, title: 'Dashboard', href: '/tutor' },
    { icon: Search, title: 'Encontrar Veterinários', href: '/tutor/search' },
    { icon: Calendar, title: 'Meus Agendamentos', href: '/tutor/appointments' },
    { icon: User, title: 'Meus Pets', href: '/tutor/pets' },
    { icon: Settings, title: 'Configurações', href: '/tutor/settings' },
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

export default TutorSidebar;

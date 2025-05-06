
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, User, Calendar, Settings } from "lucide-react";
import SidebarWrapper from './SidebarWrapper';
import SidebarItem from './SidebarItem';

const AdminSidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    { icon: Home, title: 'Dashboard', href: '/admin' },
    { icon: User, title: 'Veterinários', href: '/admin/veterinaries' },
    { icon: Calendar, title: 'Agendamentos', href: '/admin/appointments' },
    { icon: Settings, title: 'Configurações', href: '/admin/settings' },
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

export default AdminSidebar;

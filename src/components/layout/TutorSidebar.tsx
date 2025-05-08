
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Settings, User, Search, PawPrint } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar';

const TutorSidebar = () => {
  const menuItems = [
    { icon: <Home size={20} />, title: 'Dashboard', href: '/tutor' },
    { icon: <Search size={20} />, title: 'Encontrar Veterinários', href: '/tutor/search' },
    { icon: <PawPrint size={20} />, title: 'Meus Pets', href: '/tutor/pets' },
    { icon: <Calendar size={20} />, title: 'Meus Agendamentos', href: '/tutor/appointments' },
    { icon: <User size={20} />, title: 'Meu Perfil', href: '/tutor/perfil' },
    { icon: <Settings size={20} />, title: 'Configurações', href: '/tutor/settings' },
  ];

  // Logo URLs
  const logoUrl = "https://sq360.com.br/logo-hubb-novo/hubb_pet_logo.png";
  const iconUrl = "https://sq360.com.br/logo-hubb-novo/hubb_pet_icon.png";

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={iconUrl} alt="HubbPet Icon" className="h-8 w-8" />
            <img 
              src={logoUrl} 
              alt="HubbPet" 
              className="h-8 group-data-[collapsible=icon]:hidden" 
            />
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) => 
                    isActive ? 'data-[active=true]' : ''
                  }
                  end={item.href === '/tutor'}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4">
          <p className="text-xs text-gray-500">HubbPet Tutor</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default TutorSidebar;

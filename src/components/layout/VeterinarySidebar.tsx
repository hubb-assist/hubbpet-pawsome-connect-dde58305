
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Settings, User, BookOpen } from "lucide-react";
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

const VeterinarySidebar = () => {
  const menuItems = [
    { icon: <Home size={20} />, title: 'Dashboard', href: '/vet' },
    { icon: <Calendar size={20} />, title: 'Agenda', href: '/vet/agenda' },
    { icon: <BookOpen size={20} />, title: 'Meus Serviços', href: '/vet/services' },
    { icon: <User size={20} />, title: 'Meu Perfil', href: '/vet/perfil' },
    { icon: <Settings size={20} />, title: 'Configurações', href: '/vet/settings' },
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
                  end={item.href === '/vet'}
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
          <p className="text-xs text-gray-500">HubbPet Veterinário</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default VeterinarySidebar;


import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Shield, 
  DollarSign, 
  MessageSquare,
  FileText 
} from 'lucide-react';
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

const AdminSidebar = () => {
  const menuItems = [
    {
      path: '/admin',
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard'
    },
    {
      path: '/admin/usuarios',
      icon: <Users size={20} />,
      label: 'Usuários'
    },
    {
      path: '/admin/veterinarios',
      icon: <Users size={20} />,
      label: 'Aprovar Vets'
    },
    {
      path: '/admin/procedimentos',
      icon: <FileText size={20} />,
      label: 'Procedimentos'
    },
    {
      path: '/admin/conflitos',
      icon: <MessageSquare size={20} />,
      label: 'Mediação'
    },
    {
      path: '/admin/comissoes',
      icon: <DollarSign size={20} />,
      label: 'Comissões'
    },
    {
      path: '/admin/configuracoes',
      icon: <Settings size={20} />,
      label: 'Configurações'
    }
  ];
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-2 flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#2D113F]" />
          <h2 className="text-xl font-bold text-[#2D113F]">Admin</h2>
          <div className="ml-auto">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild tooltip={item.label}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    isActive ? 'data-[active=true]' : ''
                  }
                  end={item.path === '/admin'}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4">
          <p className="text-xs text-gray-500">AdminPanel v1.0</p>
          <p className="text-xs text-gray-400">© 2025 HubbPet</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;


import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Settings, User, BookOpen, LogOut } from "lucide-react";
import SidebarWrapper from './SidebarWrapper';
import SidebarItem from './SidebarItem';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

const VeterinarySidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const { signOut } = useAuth();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast("Logout realizado", {
        description: "Você foi desconectado com sucesso."
      });
      navigate('/auth');
    } catch (error: any) {
      toast("Erro ao fazer logout", {
        description: error.message || "Ocorreu um erro durante o logout."
      });
    }
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
      
      {/* Adicionando um espaçador antes do botão de logout */}
      <div className="flex-grow" style={{ minHeight: '20px' }}></div>
      
      {/* Botão de Logout */}
      <div 
        className={`
          flex items-center p-2 rounded-md cursor-pointer transition-colors
          text-white hover:bg-sidebar-accent mt-auto
        `}
        onClick={handleLogout}
      >
        <div className={`
          flex items-center
          ${!isExpanded ? 'mx-auto justify-center' : 'mr-3'}
        `}>
          <LogOut size={20} />
        </div>
        
        {isExpanded && (
          <span className="text-sm font-medium text-[15px]">Sair</span>
        )}
      </div>
    </SidebarWrapper>
  );
};

export default VeterinarySidebar;

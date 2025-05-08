
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  Users,
  Settings, 
  Shield, 
  UserCheck, 
  HelpCircle, 
  List, 
  DollarSign, 
  MessageSquare 
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // O sidebar tem fundo escuro, então usamos o logo branco (claro)
  const logoUrl = "https://sq360.com.br/logo-hubb-novo/hubb_pet_logo.png";

  const menuItems = [
    { icon: Home, title: 'Dashboard', href: '/admin' },
    { icon: Users, title: 'Usuários', href: '/admin/usuarios' },
    { icon: UserCheck, title: 'Aprovação Veterinários', href: '/admin/veterinarios' },
    { icon: List, title: 'Procedimentos', href: '/admin/procedimentos' },
    { icon: MessageSquare, title: 'Mediação de Conflitos', href: '/admin/conflitos' },
    { icon: DollarSign, title: 'Comissões', href: '/admin/comissoes' },
    { icon: Settings, title: 'Configurações', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-hubbpet-primary text-white w-64">
      <div className="flex flex-col">
        <div className="flex items-center justify-center p-4 border-b border-gray-800">
          <img src={logoUrl} alt="HubbPet" className="max-h-10" />
        </div>
      </div>
      <div className="mt-6 flex flex-col px-4 space-y-1">
        {menuItems.map((item) => (
          <div
            key={item.href}
            className={`
              flex items-center p-2 rounded-md cursor-pointer transition-colors
              ${location.pathname === item.href ? 'bg-[#2D113F] text-white' : 'text-white hover:bg-sidebar-accent'}
            `}
            onClick={() => navigate(item.href)}
          >
            <div className="mr-3">
              <item.icon size={20} />
            </div>
            <span className="text-sm font-medium text-[15px]">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;


import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Stethoscope, 
  Calendar, 
  ClipboardList
} from 'lucide-react';

type VeterinarySidebarProps = {
  closeSidebar?: () => void;
}

const VeterinarySidebar = ({ closeSidebar = () => {} }: VeterinarySidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // O sidebar tem fundo escuro, então usamos o logo branco (claro)
  const logoUrl = "https://sq360.com.br/logo-hubb-novo/hubb_pet_logo.png";

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { 
      path: '/vet', 
      icon: LayoutDashboard, 
      text: 'Dashboard' 
    },
    { 
      path: '/vet/perfil', 
      icon: User, 
      text: 'Meu Perfil' 
    },
    { 
      path: '/vet/services', 
      icon: Stethoscope, 
      text: 'Serviços' 
    },
    { 
      path: '/vet/agenda', 
      icon: Calendar, 
      text: 'Disponibilidade' 
    },
    { 
      path: '/vet/agendamentos', 
      icon: ClipboardList, 
      text: 'Agendamentos' 
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <div className="min-h-screen bg-hubbpet-primary text-white w-64">
      <div className="flex flex-col">
        <div className="flex items-center justify-center p-4 border-b border-gray-800">
          <img src={logoUrl} alt="HubbPet" className="max-h-10" />
        </div>
      </div>
      <div className="mt-6 flex flex-col px-4 space-y-1">
        {navigationItems.map((item) => (
          <div
            key={item.path}
            className={`
              flex items-center p-2 rounded-md cursor-pointer transition-colors
              ${isActive(item.path) ? 'bg-[#2D113F] text-white' : 'text-white hover:bg-sidebar-accent'}
            `}
            onClick={() => handleNavigate(item.path)}
          >
            <div className="mr-3">
              <item.icon size={20} />
            </div>
            <span className="text-sm font-medium text-[15px]">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VeterinarySidebar;

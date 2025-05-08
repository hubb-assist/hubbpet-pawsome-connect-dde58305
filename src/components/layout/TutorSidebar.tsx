
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Settings, User, Search, PawPrint } from "lucide-react";

const TutorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // O sidebar tem fundo escuro, então usamos o logo branco (claro)
  const logoUrl = "https://sq360.com.br/logo-hubb-novo/hubb_pet_logo.png";

  const menuItems = [
    { icon: Home, title: 'Dashboard', href: '/tutor' },
    { icon: Search, title: 'Encontrar Veterinários', href: '/tutor/search' },
    { icon: PawPrint, title: 'Meus Pets', href: '/tutor/pets' },
    { icon: Calendar, title: 'Meus Agendamentos', href: '/tutor/appointments' },
    { icon: User, title: 'Meu Perfil', href: '/tutor/perfil' },
    { icon: Settings, title: 'Configurações', href: '/tutor/settings' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

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
            onClick={() => handleNavigate(item.href)}
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

export default TutorSidebar;

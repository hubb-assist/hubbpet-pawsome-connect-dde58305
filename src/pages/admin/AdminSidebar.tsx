
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Shield, 
  DollarSign, 
  MessageSquare 
} from 'lucide-react';

const AdminSidebar = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      path: '/admin',
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard'
    },
    {
      path: '/admin/veterinarios',
      icon: <Users size={20} />,
      label: 'Aprovar Vets'
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
    <div className="bg-white border-r min-h-screen w-64 p-4 flex flex-col shadow-sm">
      <div className="py-2 flex items-center gap-2 px-4 mb-6">
        <Shield className="h-6 w-6 text-[#2D113F]" />
        <h2 className="text-xl font-bold text-[#2D113F]">Admin</h2>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-[#2D113F] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
                end={item.path === '/admin'}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto pt-4">
        <div className="px-4 py-2">
          <p className="text-xs text-gray-500">AdminPanel v1.0</p>
          <p className="text-xs text-gray-400">© 2025 HubbPet</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;

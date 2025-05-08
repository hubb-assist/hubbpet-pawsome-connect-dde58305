
import React, { useState } from 'react';
import TutorSidebar from './TutorSidebar';
import VeterinarySidebar from './VeterinarySidebar';
import AdminSidebar from './AdminSidebar';
import NavbarWithLogout from './NavbarWithLogout';

interface AppLayoutProps {
  userRole: 'tutor' | 'veterinario' | 'admin';
  children: React.ReactNode;
}

const AppLayout = ({ userRole, children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderSidebar = () => {
    switch (userRole) {
      case 'tutor':
        return <TutorSidebar />;
      case 'veterinario':
        return <VeterinarySidebar closeSidebar={() => setSidebarOpen(false)} />;
      case 'admin':
        return <AdminSidebar />;
      default:
        return <TutorSidebar />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <div className={`min-h-screen ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
          {renderSidebar()}
        </div>
        <div className="flex-1 flex flex-col">
          <NavbarWithLogout toggleSidebar={toggleSidebar} />
          <div className="flex-1 p-6 bg-gray-50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

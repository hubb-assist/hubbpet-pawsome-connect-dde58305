
import React, { useState } from 'react';
import TutorSidebar from './TutorSidebar';
import VeterinarySidebar from './VeterinarySidebar';
import AdminSidebar from './AdminSidebar';
import NavbarWithLogout from './NavbarWithLogout';
import SidebarWrapper from './SidebarWrapper';

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
        return <TutorSidebar isExpanded={sidebarOpen} toggleSidebar={toggleSidebar} />;
      case 'veterinario':
        return <VeterinarySidebar isExpanded={sidebarOpen} toggleSidebar={toggleSidebar} />;
      case 'admin':
        return <AdminSidebar isExpanded={sidebarOpen} toggleSidebar={toggleSidebar} />;
      default:
        return <TutorSidebar isExpanded={sidebarOpen} toggleSidebar={toggleSidebar} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <div className={`${sidebarOpen ? 'block' : 'hidden md:block'}`}>
          <SidebarWrapper isExpanded={sidebarOpen} toggleSidebar={toggleSidebar}>
            {renderSidebar()}
          </SidebarWrapper>
        </div>
        <div className="flex-1 flex flex-col">
          <NavbarWithLogout />
          <div className="flex-1 p-6 bg-gray-50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

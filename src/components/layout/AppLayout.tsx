
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TutorSidebar from './TutorSidebar';
import VeterinarySidebar from './VeterinarySidebar';
import AdminSidebar from './AdminSidebar';
import NavbarWithLogout from './NavbarWithLogout';

interface AppLayoutProps {
  userRole: 'tutor' | 'veterinary' | 'admin';
  children: React.ReactNode;
}

const AppLayout = ({ userRole, children }: AppLayoutProps) => {
  const renderSidebar = () => {
    switch (userRole) {
      case 'tutor':
        return <TutorSidebar />;
      case 'veterinary':
        return <VeterinarySidebar />;
      case 'admin':
        return <AdminSidebar />;
      default:
        return <TutorSidebar />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full">
        <div className="flex flex-1">
          {renderSidebar()}
          <div className="flex-1 flex flex-col">
            <NavbarWithLogout />
            <div className="flex-1 p-6 bg-gray-50">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;

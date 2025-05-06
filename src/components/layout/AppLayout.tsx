
import React from 'react';
import { Outlet } from 'react-router-dom';
import TutorSidebar from './TutorSidebar';
import VeterinarySidebar from './VeterinarySidebar';
import AdminSidebar from './AdminSidebar';

interface AppLayoutProps {
  userRole: 'tutor' | 'veterinary' | 'admin';
}

const AppLayout = ({ userRole }: AppLayoutProps) => {
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
    <div className="flex min-h-screen">
      {renderSidebar()}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;

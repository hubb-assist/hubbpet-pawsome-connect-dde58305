
import React from 'react';
import TutorSidebar from './TutorSidebar';
import VeterinarySidebar from './VeterinarySidebar';
import AdminSidebar from './AdminSidebar';

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
    <div className="flex min-h-screen">
      {renderSidebar()}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;

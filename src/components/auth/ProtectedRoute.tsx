
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!role) {
    return <Navigate to="/escolher-perfil" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirecionar para a dashboard apropriada do usuário
    switch (role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'veterinario':
        return <Navigate to="/vet" replace />;
      case 'tutor':
        return <Navigate to="/tutor" replace />;
      default:
        return <Navigate to="/auth" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

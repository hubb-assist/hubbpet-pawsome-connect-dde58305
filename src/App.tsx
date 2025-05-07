
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import AuthPage from '@/pages/auth/AuthPage';
import EscolherPerfilPage from '@/pages/auth/EscolherPerfilPage';
import RegistroVeterinarioPage from '@/pages/auth/RegistroVeterinarioPage';
import VeterinarioDashboard from '@/pages/veterinario/VeterinarioDashboard';
import TutorDashboard from '@/pages/tutor/TutorDashboard';
import TutorProfilePage from '@/pages/tutor/TutorProfilePage';
import PetsPage from '@/pages/tutor/PetsPage';
import NotFound from '@/pages/NotFound';
import AppLayout from '@/components/layout/AppLayout';
import AdminRoutes from '@/pages/admin/AdminRoutes';
import VeterinarioPerfilPage from '@/pages/veterinario/VeterinarioProfilePage';
import AgendaPage from '@/pages/veterinario/AgendaPage';
import AguardandoAprovacaoPage from '@/pages/auth/AguardandoAprovacaoPage';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, userRole }: { children: React.ReactNode; userRole: string }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (role !== userRole) {
    return <div>Acesso negado.</div>;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Index />} />

          <Route path="/auth" element={<AuthPage />} />
          <Route path="/escolher-perfil" element={<EscolherPerfilPage />} />
          <Route path="/veterinario/registro" element={<RegistroVeterinarioPage />} />
          <Route path="/vet/aguardando-aprovacao" element={<AguardandoAprovacaoPage />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute userRole="admin">
                <AppLayout userRole="admin">
                  <AdminRoutes />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vet/*"
            element={
              <ProtectedRoute userRole="veterinario">
                <AppLayout userRole="veterinary">
                  <Routes>
                    <Route path="/" element={<VeterinarioDashboard />} />
                    <Route path="/agenda" element={<AgendaPage />} />
                    <Route path="/perfil" element={<VeterinarioPerfilPage />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tutor/*"
            element={
              <ProtectedRoute userRole="tutor">
                <AppLayout userRole="tutor">
                  <Routes>
                    <Route path="/" element={<TutorDashboard />} />
                    <Route path="/perfil" element={<TutorProfilePage />} />
                    <Route path="/pets" element={<PetsPage />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;

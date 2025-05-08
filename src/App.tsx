
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
import LoadingScreen from '@/components/ui/LoadingScreen';
import ServicosPage from '@/pages/veterinario/ServicosPage';
import SearchVeterinarioPage from '@/pages/tutor/SearchVeterinarioPage';
import VeterinarioDetalhePage from '@/pages/tutor/VeterinarioDetalhePage';
import AgendamentoVeterinarioPage from '@/pages/veterinario/AgendamentoVeterinarioPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children, userRole }: { children: React.ReactNode; userRole: string }) => {
  const { user, role, isLoading } = useAuth();

  // Mostrando um indicador de carregamento enquanto verificamos a autenticação
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirecionando para a página de login se o usuário não estiver autenticado
  if (!user) {
    console.log("Usuário não autenticado, redirecionando para /auth");
    return <Navigate to="/auth" replace />;
  }

  // Redirecionando para a página de escolha de perfil se o usuário não tiver um papel definido
  if (!role) {
    console.log("Usuário sem papel definido, redirecionando para /escolher-perfil");
    return <Navigate to="/escolher-perfil" replace />;
  }

  // Verificando se o usuário tem o papel necessário para acessar a rota
  if (role !== userRole) {
    console.log(`Acesso negado. Papel atual: ${role}, Papel necessário: ${userRole}`);
    
    // Redirecionando para a dashboard apropriada com base no papel do usuário
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
                <AppLayout userRole="veterinario">
                  <Routes>
                    <Route path="/" element={<VeterinarioDashboard />} />
                    <Route path="/agenda" element={<AgendaPage />} />
                    <Route path="/agendamentos" element={<AgendamentoVeterinarioPage />} />
                    <Route path="/perfil" element={<VeterinarioPerfilPage />} />
                    <Route path="/services" element={<ServicosPage />} />
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
                    <Route path="/search" element={<SearchVeterinarioPage />} />
                    <Route path="/veterinario/:id" element={<VeterinarioDetalhePage />} />
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

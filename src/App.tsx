
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import LandingPage from "./pages/landing/LandingPage";
import AuthPage from "./pages/auth/AuthPage";
import NotFound from "./pages/NotFound";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import VeterinarioDashboard from "./pages/veterinario/VeterinarioDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EscolherPerfilPage from "./pages/auth/EscolherPerfilPage";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/escolher-perfil" element={<EscolherPerfilPage />} />
              
              {/* Rotas de tutor */}
              <Route path="/tutor" element={
                <ProtectedRoute allowedRoles={['tutor']}>
                  <AppLayout userRole="tutor" />
                </ProtectedRoute>
              }>
                <Route index element={<TutorDashboard />} />
                {/* Adicione outras rotas de tutor aqui */}
              </Route>
              
              {/* Rotas de veterinário */}
              <Route path="/vet" element={
                <ProtectedRoute allowedRoles={['veterinario']}>
                  <AppLayout userRole="veterinary" />
                </ProtectedRoute>
              }>
                <Route index element={<VeterinarioDashboard />} />
                {/* Adicione outras rotas de veterinário aqui */}
              </Route>
              
              {/* Rotas de admin */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout userRole="admin" />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                {/* Adicione outras rotas de admin aqui */}
              </Route>
              
              {/* Rota 404 para capturar URLs inexistentes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

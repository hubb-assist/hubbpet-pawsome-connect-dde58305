import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import LandingPage from "./pages/landing/LandingPage";
import AuthPage from "./pages/auth/AuthPage";
import NotFound from "./pages/NotFound";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => {
  // Note: In a real app, this would be determined by authentication state
  // For now, we'll simulate with a hardcoded value
  const mockUserRole = 'tutor'; // 'tutor', 'veterinary', or 'admin'
  const isAuthenticated = false; // This would normally come from auth state

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Tutor routes - would normally be protected */}
            <Route path="/tutor" element={<AppLayout userRole="tutor" />}>
              <Route index element={<TutorDashboard />} />
              {/* Other tutor routes would go here */}
            </Route>
            
            {/* Veterinary routes - would normally be protected */}
            <Route path="/vet" element={<AppLayout userRole="veterinary" />}>
              <Route index element={<div className="p-4">Veterinary Dashboard (to be implemented)</div>} />
              {/* Other veterinary routes would go here */}
            </Route>
            
            {/* Admin routes - would normally be protected */}
            <Route path="/admin" element={<AppLayout userRole="admin" />}>
              <Route index element={<div className="p-4">Admin Dashboard (to be implemented)</div>} />
              {/* Other admin routes would go here */}
            </Route>
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

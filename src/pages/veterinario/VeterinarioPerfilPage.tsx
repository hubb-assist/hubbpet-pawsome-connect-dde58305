
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import VeterinarioProfileForm from '@/components/veterinario/VeterinarioProfileForm';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const VeterinarioPerfilPage: React.FC = () => {
  const { user, signOut, isLoading } = useAuth();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
          variant: "destructive"
        });
        navigate('/auth');
      } else {
        setIsAuthChecked(true);
      }
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro durante o logout.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D113F]"></div>
      </div>
    );
  }

  if (!isAuthChecked) {
    return null;
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
      <VeterinarioProfileForm />
    </div>
  );
};

export default VeterinarioPerfilPage;

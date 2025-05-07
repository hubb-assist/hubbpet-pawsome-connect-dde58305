
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavbarWithLogout: React.FC = () => {
  const { user, signOut, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Determina a rota inicial baseada no papel do usuário
  const getUserHomeRoute = () => {
    switch(role) {
      case 'admin': return '/admin';
      case 'veterinario': return '/vet';
      case 'tutor': return '/tutor';
      default: return '/';
    }
  };

  const userTypeLabel = () => {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'veterinario': return 'Veterinário';
      case 'tutor': return 'Tutor';
      default: return 'Usuário';
    }
  };

  return (
    <div className="flex justify-end items-center p-4 bg-[#2D113F] text-white">      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-white hover:bg-[#3D2150]"
          >
            <User size={18} />
            <span className="hidden sm:inline">{user?.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{userTypeLabel()}</DropdownMenuLabel>
          <DropdownMenuLabel className="text-xs text-muted-foreground">{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate(getUserHomeRoute())}>
            Dashboard
          </DropdownMenuItem>
          {role === 'veterinario' && (
            <DropdownMenuItem onClick={() => navigate('/vet/perfil')}>
              Meu Perfil
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-500">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NavbarWithLogout;


import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import VeterinarioProfileForm from '@/components/veterinario/VeterinarioProfileForm';

const VeterinarioPerfilPage = () => {
  const { user } = useAuth();

  const handleProfileUpdate = async (data: any) => {
    try {
      console.log("Dados do perfil atualizados:", data);
      
      // Simulação de atualização bem-sucedida
      toast("Perfil atualizado", {
        description: "Seus dados foram atualizados com sucesso."
      });
      
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast("Erro ao atualizar perfil", {
        description: error.message || "Ocorreu um erro ao atualizar o perfil."
      });
    }
  };

  if (!user) {
    toast("Acesso não autorizado", {
      description: "Você precisa estar logado para acessar esta página."
    });
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil Profissional</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <VeterinarioProfileForm onSubmit={handleProfileUpdate} />
      </div>
    </div>
  );
};

export default VeterinarioPerfilPage;

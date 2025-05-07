
import React, { useEffect, useState } from 'react';
import { Calendar, List } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DisponibilidadeList from '@/components/veterinario/DisponibilidadeList';
import DisponibilidadeForm from '@/components/veterinario/DisponibilidadeForm';

const AgendaPage = () => {
  const { user } = useAuth();
  const [veterinarioId, setVeterinarioId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      buscarPerfilVeterinario();
    }
  }, [user]);

  const buscarPerfilVeterinario = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('veterinarios')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        throw new Error("Perfil de veterinário não encontrado");
      }

      setVeterinarioId(data.id);
    } catch (error: any) {
      console.error("Erro ao buscar perfil:", error);
      toast("Erro ao carregar perfil", {
        description: "Não foi possível recuperar seu perfil de veterinário."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D113F]"></div>
      </div>
    );
  }

  if (!veterinarioId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Perfil não encontrado</h2>
        <p className="mt-2">Você precisa completar seu perfil de veterinário para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Minha Agenda</h1>

      <Tabs defaultValue="disponibilidade" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="disponibilidade" className="flex items-center">
            <List className="h-4 w-4 mr-2" />
            Disponibilidade
          </TabsTrigger>
          <TabsTrigger value="calendario" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Calendário
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="disponibilidade">
          <DisponibilidadeList veterinarioId={veterinarioId} />
        </TabsContent>
        
        <TabsContent value="calendario">
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-medium mb-4">Calendário de Agendamentos</h2>
            <p className="text-gray-500">
              Esta funcionalidade estará disponível em breve. Aqui você poderá visualizar todos os seus agendamentos em formato de calendário.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgendaPage;

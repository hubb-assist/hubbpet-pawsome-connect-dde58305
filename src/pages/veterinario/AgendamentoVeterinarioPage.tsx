
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

// Definindo o tipo para o status do agendamento
type AgendamentoStatus = 'pendente' | 'confirmado' | 'realizado' | 'cancelado';

interface Agendamento {
  id: string;
  servico: {
    nome: string;
    preco: number;
    duracao_minutos: number;
  };
  tutor: {
    nome: string;
    email: string;
    telefone: string;
  };
  pet: {
    nome: string;
    especie: string;
    raca: string;
  };
  data_hora: string;
  status: AgendamentoStatus;
}

const AgendamentoVeterinarioPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('pendente');
  
  // Buscar agendamentos do veterinário
  const { data: agendamentos, isLoading, refetch } = useQuery({
    queryKey: ['agendamentos', user?.id, activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora,
          status,
          servico:servico_id (nome, preco, duracao_minutos),
          tutor:tutor_id (nome, email, telefone),
          pet:pet_id (nome, especie, raca)
        `)
        .eq('veterinario_id', user?.id)
        .eq('status', activeTab)
        .order('data_hora', { ascending: true });
        
      if (error) {
        throw new Error(error.message);
      }
      return data as Agendamento[];
    },
    enabled: !!user?.id
  });

  const handleUpdateStatus = async (agendamentoId: string, novoStatus: AgendamentoStatus) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', agendamentoId);
      
      if (error) throw new Error(error.message);
      
      toast.success(`Status do agendamento atualizado para ${novoStatus}`);
      refetch();
    } catch (error) {
      toast.error('Falha ao atualizar o status do agendamento');
      console.error(error);
    }
  };

  const getBadgeStyle = (status: AgendamentoStatus) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-200 text-yellow-800';
      case 'confirmado':
        return 'bg-blue-200 text-blue-800';
      case 'realizado':
        return 'bg-green-200 text-green-800';
      case 'cancelado':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const formatarData = (data: string) => {
    return format(new Date(data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Agendamentos</h1>
      
      <Tabs defaultValue="pendente" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="confirmado">Confirmados</TabsTrigger>
          <TabsTrigger value="realizado">Realizados</TabsTrigger>
          <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
        </TabsList>

        {['pendente', 'confirmado', 'realizado', 'cancelado'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {isLoading && <p>Carregando agendamentos...</p>}
            
            {!isLoading && agendamentos && agendamentos.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhum agendamento {status} encontrado.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {!isLoading && agendamentos && agendamentos.map((agendamento) => (
              <Card key={agendamento.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{agendamento.servico.nome}</CardTitle>
                      <CardDescription>
                        {formatarData(agendamento.data_hora)} - Duração: {agendamento.servico.duracao_minutos} minutos
                      </CardDescription>
                    </div>
                    <Badge className={getBadgeStyle(agendamento.status)}>
                      {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Tutor</h3>
                      <p>{agendamento.tutor.nome}</p>
                      <p>{agendamento.tutor.email}</p>
                      <p>{agendamento.tutor.telefone}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Pet</h3>
                      <p>{agendamento.pet.nome}</p>
                      <p>{agendamento.pet.especie} - {agendamento.pet.raca}</p>
                    </div>
                  </div>
                  
                  {agendamento.status === 'pendente' && (
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="default"
                        onClick={() => handleUpdateStatus(agendamento.id, 'confirmado')}
                      >
                        Confirmar
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleUpdateStatus(agendamento.id, 'cancelado')}
                      >
                        Recusar
                      </Button>
                    </div>
                  )}
                  
                  {agendamento.status === 'confirmado' && (
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="default"
                        onClick={() => handleUpdateStatus(agendamento.id, 'realizado')}
                      >
                        Marcar como realizado
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleUpdateStatus(agendamento.id, 'cancelado')}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AgendamentoVeterinarioPage;

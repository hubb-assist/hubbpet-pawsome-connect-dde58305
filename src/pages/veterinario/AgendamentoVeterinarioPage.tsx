
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Agendamento = {
  id: string;
  data_hora: string;
  status: 'pendente' | 'confirmado' | 'realizado' | 'cancelado';
  tutor: {
    nome: string;
    telefone: string | null;
  };
  pet: {
    nome: string;
    especie: string;
  };
  servico: {
    nome: string;
    duracao_minutos: number;
    preco: number;
  };
};

const AgendamentoVeterinarioPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [veterinarioId, setVeterinarioId] = useState<string | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<'pendente' | 'confirmado' | 'realizado' | 'cancelado' | 'todos'>('todos');

  useEffect(() => {
    if (user) {
      buscarPerfilVeterinario();
    }
  }, [user]);

  useEffect(() => {
    if (veterinarioId) {
      carregarAgendamentos();
    }
  }, [veterinarioId, statusFiltro]);

  const buscarPerfilVeterinario = async () => {
    try {
      const { data, error } = await supabase
        .from('veterinarios')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      setVeterinarioId(data.id);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      toast("Erro ao carregar perfil", {
        description: "Não foi possível recuperar seu perfil de veterinário."
      });
    }
  };

  const carregarAgendamentos = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora,
          status,
          tutores!inner(nome, telefone),
          pets!inner(nome, especie),
          servicos!inner(nome, duracao_minutos, preco)
        `)
        .eq('veterinario_id', veterinarioId);
      
      // Filtrar por status se não for 'todos'
      if (statusFiltro !== 'todos') {
        query = query.eq('status', statusFiltro);
      }
      
      const { data, error } = await query.order('data_hora', { ascending: true });
      
      if (error) throw error;
      
      // Mapear para o formato esperado
      const agendamentosMapeados = data.map(item => ({
        id: item.id,
        data_hora: item.data_hora,
        status: item.status,
        tutor: {
          nome: item.tutores.nome,
          telefone: item.tutores.telefone
        },
        pet: {
          nome: item.pets.nome,
          especie: item.pets.especie
        },
        servico: {
          nome: item.servicos.nome,
          duracao_minutos: item.servicos.duracao_minutos,
          preco: item.servicos.preco
        }
      }));
      
      setAgendamentos(agendamentosMapeados);
      
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast("Erro ao carregar agendamentos", {
        description: "Não foi possível carregar seus agendamentos."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarStatusAgendamento = async (id: string, novoStatus: 'pendente' | 'confirmado' | 'realizado' | 'cancelado') => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast("Status atualizado", {
        description: "O status do agendamento foi atualizado com sucesso."
      });
      
      // Atualizar a lista
      setAgendamentos(agendamentos.map(ag => 
        ag.id === id ? { ...ag, status: novoStatus } : ag
      ));
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast("Erro ao atualizar", {
        description: "Não foi possível atualizar o status deste agendamento."
      });
    }
  };

  const formatarDataHora = (dataHora: string) => {
    const date = new Date(dataHora);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const renderStatus = (status: 'pendente' | 'confirmado' | 'realizado' | 'cancelado') => {
    const statusConfig = {
      pendente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      confirmado: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmado' },
      realizado: { bg: 'bg-green-100', text: 'text-green-800', label: 'Realizado' },
      cancelado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };

    const config = statusConfig[status];
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

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
      <h1 className="text-2xl font-bold mb-6">Meus Agendamentos</h1>
      
      <div className="mb-6">
        <Tabs defaultValue="todos" onValueChange={(v) => setStatusFiltro(v as any)}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="confirmado">Confirmados</TabsTrigger>
            <TabsTrigger value="realizado">Realizados</TabsTrigger>
            <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D113F]"></div>
        </div>
      ) : agendamentos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Você não possui agendamentos {statusFiltro !== 'todos' ? `com status ${statusFiltro}` : ''}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {agendamentos.map(agendamento => (
            <Card key={agendamento.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{agendamento.tutor.nome}</CardTitle>
                  {renderStatus(agendamento.status)}
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div className="space-y-2">
                    <p><span className="font-medium">Serviço:</span> {agendamento.servico.nome}</p>
                    <p><span className="font-medium">Pet:</span> {agendamento.pet.nome} ({agendamento.pet.especie})</p>
                    <p><span className="font-medium">Data/Hora:</span> {formatarDataHora(agendamento.data_hora)}</p>
                    <p><span className="font-medium">Duração:</span> {agendamento.servico.duracao_minutos} minutos</p>
                    {agendamento.tutor.telefone && (
                      <p><span className="font-medium">Telefone:</span> {agendamento.tutor.telefone}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-start">
                    {agendamento.status === 'pendente' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => atualizarStatusAgendamento(agendamento.id, 'confirmado')}
                          className="bg-[#2D113F] hover:bg-[#2D113F]/80"
                        >
                          Confirmar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => atualizarStatusAgendamento(agendamento.id, 'cancelado')}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    
                    {agendamento.status === 'confirmado' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => atualizarStatusAgendamento(agendamento.id, 'realizado')}
                        >
                          Marcar como Realizado
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => atualizarStatusAgendamento(agendamento.id, 'cancelado')}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgendamentoVeterinarioPage;

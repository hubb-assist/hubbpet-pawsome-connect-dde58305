
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

type Agendamento = {
  id: string;
  data_hora: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
  pet: {
    id: string;
    nome: string;
    especie: string;
  };
  servico: {
    id: string;
    nome: string;
    duracao_minutos: number;
  };
  tutor: {
    id: string;
    nome: string;
    telefone: string | null;
  };
};

const AgendamentoVeterinarioPage = () => {
  const { user } = useAuth();
  const [veterinarioId, setVeterinarioId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      buscarPerfilVeterinario();
    }
  }, [user]);

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
      console.error("Erro ao buscar perfil veterinário:", error);
      toast("Erro ao carregar perfil", {
        description: "Não foi possível recuperar seu perfil de veterinário."
      });
    }
  };

  // Busca os agendamentos do veterinário
  const { data: agendamentos, isLoading, error } = useQuery({
    queryKey: ['agendamentos', veterinarioId, filtroStatus],
    queryFn: async () => {
      if (!veterinarioId) return [];

      let query = supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora,
          status,
          pet:pet_id (id, nome, especie),
          servico:servico_id (id, nome, duracao_minutos),
          tutor:tutor_id (id, nome, telefone)
        `)
        .eq('veterinario_id', veterinarioId)
        .order('data_hora', { ascending: true });

      if (filtroStatus !== 'todos') {
        query = query.eq('status', filtroStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Agendamento[];
    },
    enabled: !!veterinarioId
  });

  const alterarStatusAgendamento = async (agendamentoId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', agendamentoId);

      if (error) throw error;

      toast("Status atualizado", {
        description: `Agendamento ${novoStatus} com sucesso!`
      });

      // Atualiza os dados
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast("Erro ao atualizar", {
        description: "Não foi possível atualizar o status do agendamento."
      });
    }
  };

  const formatarData = (dataString: string) => {
    const data = parseISO(dataString);
    return format(data, "dd 'de' MMMM", { locale: ptBR });
  };

  const formatarHora = (dataString: string) => {
    const data = parseISO(dataString);
    return format(data, "HH:mm");
  };

  const formatarDataCompleta = (dataString: string) => {
    const data = parseISO(dataString);
    return format(data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pendente</span>;
      case 'confirmado':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Confirmado</span>;
      case 'concluido':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Concluído</span>;
      case 'cancelado':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Cancelado</span>;
      default:
        return null;
    }
  };

  if (!veterinarioId) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
            <CardDescription>
              Aguarde enquanto buscamos seus dados de perfil
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Meus Agendamentos</h1>

      <div className="mb-6">
        <Card className="bg-[#2D113F]/5">
          <CardContent className="flex flex-wrap items-center justify-between p-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <Calendar className="h-5 w-5 mr-2 text-[#2D113F]" />
              <span className="text-[#2D113F] font-medium">Filtrar por status:</span>
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="proximos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="proximos">Próximos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="proximos">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D113F]"></div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center text-red-500">
                Ocorreu um erro ao buscar seus agendamentos.
              </CardContent>
            </Card>
          ) : agendamentos && agendamentos.length > 0 ? (
            <div className="space-y-4">
              {agendamentos
                .filter(a => ['pendente', 'confirmado'].includes(a.status))
                .map((agendamento) => (
                  <Card key={agendamento.id} className="overflow-hidden">
                    <CardHeader className="bg-[#2D113F]/5 pb-2">
                      <div className="flex flex-wrap justify-between items-center">
                        <div className="mb-2 sm:mb-0">
                          <CardTitle className="text-lg">{formatarData(agendamento.data_hora)}</CardTitle>
                          <CardDescription>{formatarHora(agendamento.data_hora)}</CardDescription>
                        </div>
                        <div>
                          {getStatusBadge(agendamento.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Serviço</p>
                          <p className="font-medium">{agendamento.servico.nome}</p>
                          <p className="text-xs text-gray-500">Duração: {agendamento.servico.duracao_minutos} minutos</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tutor e Pet</p>
                          <p className="font-medium">{agendamento.tutor.nome}</p>
                          <p className="text-sm">{agendamento.pet.nome} - {agendamento.pet.especie}</p>
                        </div>
                      </div>
                      {agendamento.status === 'pendente' && (
                        <div className="flex flex-wrap gap-2 mt-4 justify-end">
                          <Button
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => alterarStatusAgendamento(agendamento.id, 'cancelado')}
                          >
                            Recusar
                          </Button>
                          <Button
                            className="bg-[#2D113F] hover:bg-[#2D113F]/80"
                            onClick={() => alterarStatusAgendamento(agendamento.id, 'confirmado')}
                          >
                            Confirmar
                          </Button>
                        </div>
                      )}
                      {agendamento.status === 'confirmado' && (
                        <div className="flex flex-wrap gap-2 mt-4 justify-end">
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => alterarStatusAgendamento(agendamento.id, 'concluido')}
                          >
                            Marcar como Concluído
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Você não possui agendamentos pendentes ou confirmados.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="historico">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D113F]"></div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center text-red-500">
                Ocorreu um erro ao buscar seu histórico de agendamentos.
              </CardContent>
            </Card>
          ) : agendamentos && agendamentos.filter(a => ['concluido', 'cancelado'].includes(a.status)).length > 0 ? (
            <div className="space-y-4">
              {agendamentos
                .filter(a => ['concluido', 'cancelado'].includes(a.status))
                .map((agendamento) => (
                  <Card key={agendamento.id} className="overflow-hidden">
                    <CardHeader className={`${agendamento.status === 'cancelado' ? 'bg-red-50' : 'bg-green-50'} pb-2`}>
                      <div className="flex flex-wrap justify-between items-center">
                        <div className="mb-2 sm:mb-0">
                          <CardTitle className="text-lg">{formatarDataCompleta(agendamento.data_hora)}</CardTitle>
                        </div>
                        <div>
                          {getStatusBadge(agendamento.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Serviço</p>
                          <p className="font-medium">{agendamento.servico.nome}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tutor e Pet</p>
                          <p className="font-medium">{agendamento.tutor.nome}</p>
                          <p className="text-sm">{agendamento.pet.nome} - {agendamento.pet.especie}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Você não possui histórico de agendamentos concluídos ou cancelados.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgendamentoVeterinarioPage;

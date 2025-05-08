
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

type Agendamento = {
  id: string;
  data_hora: string;
  status: 'pendente' | 'confirmado' | 'realizado' | 'cancelado';
  veterinario: {
    nome_completo: string;
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

const AgendamentosPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [tutorId, setTutorId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      buscarPerfilTutor();
    }
  }, [user]);

  useEffect(() => {
    if (tutorId) {
      carregarAgendamentos();
    }
  }, [tutorId]);

  const buscarPerfilTutor = async () => {
    try {
      const { data, error } = await supabase
        .from('tutores')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      setTutorId(data.id);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      toast("Erro ao carregar perfil", {
        description: "Não foi possível recuperar seu perfil de tutor."
      });
    }
  };

  const carregarAgendamentos = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora,
          status,
          veterinarios!inner(nome_completo, telefone),
          pets!inner(nome, especie),
          servicos!inner(nome, duracao_minutos, preco)
        `)
        .eq('tutor_id', tutorId)
        .order('data_hora', { ascending: true });
      
      if (error) throw error;
      
      // Mapear para o formato esperado
      const agendamentosMapeados = data.map(item => ({
        id: item.id,
        data_hora: item.data_hora,
        status: item.status,
        veterinario: {
          nome_completo: item.veterinarios.nome_completo,
          telefone: item.veterinarios.telefone
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

  const cancelarAgendamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', id);
      
      if (error) throw error;
      
      toast("Agendamento cancelado", {
        description: "O agendamento foi cancelado com sucesso."
      });
      
      // Atualizar a lista
      setAgendamentos(agendamentos.map(ag => 
        ag.id === id ? { ...ag, status: 'cancelado' } : ag
      ));
      
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast("Erro ao cancelar", {
        description: "Não foi possível cancelar este agendamento."
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

  if (!tutorId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Perfil não encontrado</h2>
        <p className="mt-2">Você precisa completar seu perfil de tutor para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Meus Agendamentos</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D113F]"></div>
        </div>
      ) : agendamentos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Você ainda não tem nenhum agendamento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Pet</TableHead>
                <TableHead>Veterinário</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agendamentos.map((agendamento) => (
                <TableRow key={agendamento.id}>
                  <TableCell>{agendamento.servico.nome}</TableCell>
                  <TableCell>
                    {agendamento.pet.nome} ({agendamento.pet.especie})
                  </TableCell>
                  <TableCell>{agendamento.veterinario.nome_completo}</TableCell>
                  <TableCell>{formatarDataHora(agendamento.data_hora)}</TableCell>
                  <TableCell>{renderStatus(agendamento.status)}</TableCell>
                  <TableCell>
                    {(agendamento.status === 'pendente' || agendamento.status === 'confirmado') && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => cancelarAgendamento(agendamento.id)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AgendamentosPage;

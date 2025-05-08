
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { playNotificationSound } from '@/assets/notification-sound';

// Tipagem para os agendamentos
type Agendamento = {
  id: string;
  created_at: string;
  data_hora: string;
  status: string;
  servico: {
    nome: string;
    duracao_minutos: number;
  };
  tutor: {
    nome: string;
    telefone: string | null;
    email: string;
  };
  pet: {
    nome: string;
    especie: string;
    raca: string | null;
  };
};

const AgendamentoVeterinarioPage = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enableSound, setEnableSound] = useState(true);
  const lastAgendamentoCountRef = useRef<number | null>(null);
  const realTimeSubscription = useRef<any>(null);
  
  useEffect(() => {
    carregarAgendamentos();
    
    // Configurando a assinatura em tempo real
    const channel = supabase
      .channel('agendamentos-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'agendamentos',
          filter: `veterinario_id=eq.${user?.id}`
        }, 
        (payload) => {
          console.log('Novo agendamento recebido:', payload);
          if (enableSound) {
            playNotificationSound();
            toast("Novo agendamento recebido!", {
              description: "Um paciente acabou de agendar uma consulta com você."
            });
          }
          carregarAgendamentos();
        }
      )
      .subscribe();
      
    realTimeSubscription.current = channel;
    
    // Limpeza ao desmontar
    return () => {
      if (realTimeSubscription.current) {
        supabase.removeChannel(realTimeSubscription.current);
      }
    };
  }, [user, enableSound]);

  const carregarAgendamentos = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          created_at,
          data_hora,
          status,
          servico:servico_id (
            nome,
            duracao_minutos
          ),
          tutor:tutor_id (
            nome,
            telefone,
            email
          ),
          pet:pet_id (
            nome,
            especie,
            raca
          )
        `)
        .eq('veterinario_id', user.id)
        .order('data_hora', { ascending: true });
      
      if (error) throw error;
      
      // Verificar se há novos agendamentos para notificar
      if (lastAgendamentoCountRef.current !== null && 
          data.length > lastAgendamentoCountRef.current && 
          enableSound) {
        playNotificationSound();
      }
      
      lastAgendamentoCountRef.current = data.length;
      setAgendamentos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar agendamentos:', error.message);
      toast("Erro ao carregar agendamentos", {
        description: "Não foi possível obter seus agendamentos. Tente novamente mais tarde."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarStatusAgendamento = async (id: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      toast("Status atualizado", {
        description: `Agendamento ${novoStatus === 'confirmado' ? 'confirmado' : 'rejeitado'} com sucesso.`
      });
      
      carregarAgendamentos();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error.message);
      toast("Erro ao atualizar status", {
        description: "Não foi possível atualizar o status. Tente novamente."
      });
    }
  };
  
  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'concluido':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return format(data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Agendamentos</h1>
        
        <div className="flex items-center space-x-2">
          <Bell className={enableSound ? "text-hubbpet-primary" : "text-gray-400"} size={20} />
          <Switch 
            checked={enableSound} 
            onCheckedChange={setEnableSound} 
          />
          <span className="text-sm text-gray-600">Som de notificação</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hubbpet-primary"></div>
        </div>
      ) : agendamentos.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-gray-600">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agendamentos.map((agendamento) => (
            <div key={agendamento.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{agendamento.servico.nome}</h3>
                <span className={`text-xs px-2 py-1 rounded font-medium ${getBadgeClass(agendamento.status)}`}>
                  {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p><span className="font-medium">Cliente:</span> {agendamento.tutor.nome}</p>
                <p><span className="font-medium">Contato:</span> {agendamento.tutor.telefone || agendamento.tutor.email}</p>
                <p><span className="font-medium">Pet:</span> {agendamento.pet.nome} ({agendamento.pet.especie}{agendamento.pet.raca ? `, ${agendamento.pet.raca}` : ''})</p>
                <p><span className="font-medium">Data/Hora:</span> {formatarData(agendamento.data_hora)}</p>
                <p><span className="font-medium">Duração:</span> {agendamento.servico.duracao_minutos} min</p>
              </div>
              
              {agendamento.status === 'pendente' && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    onClick={() => atualizarStatusAgendamento(agendamento.id, 'confirmado')}
                  >
                    Confirmar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    onClick={() => atualizarStatusAgendamento(agendamento.id, 'cancelado')}
                  >
                    Rejeitar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgendamentoVeterinarioPage;


import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Mail, 
  MessageSquare, 
  AlertTriangle, 
  Clock, 
  RotateCcw,
  CheckCircle,
  XCircle,
  RefreshCcw
} from 'lucide-react';

// Defina os tipos para evitar erros TypeScript
interface Tutor {
  nome_completo: string;
  email: string;
}

interface Veterinario {
  nome_completo: string;
  email: string;
}

interface Agendamento {
  id: string;
  data_hora: string;
  servico: {
    nome: string;
  };
}

interface Usuario {
  email: string;
}

interface Mensagem {
  id: string;
  conflito_id: string;
  mensagem: string;
  created_at: string;
  user_id: string;
  tipo_usuario: string;
  user: Usuario;
}

interface Conflito {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  created_at: string;
  agendamento_id: string;
  tutor_id: string;
  veterinario_id: string;
  resolvido: boolean;
  estorno_solicitado: boolean;
  estorno_aprovado: boolean;
  agendamento: Agendamento;
  veterinario: Veterinario;
  tutor: Tutor;
  mensagens?: Mensagem[];
}

const MediacaoConflitosPage: React.FC = () => {
  const [conflitos, setConflitos] = useState<Conflito[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [conflitoSelecionado, setConflitoSelecionado] = useState<Conflito | null>(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Buscar conflitos
  useEffect(() => {
    const fetchConflitos = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('conflitos')
          .select(`
            *,
            agendamento:agendamento_id (
              id,
              data_hora,
              servico:servico_id (nome)
            ),
            tutor:tutor_id (*),
            veterinario:veterinario_id (*)
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Conversão explícita para satisfazer o TypeScript
        setConflitos(data as unknown as Conflito[]);
        
        // Se selecionarmos o primeiro conflito automaticamente
        if (data && data.length > 0) {
          setConflitoSelecionado(data[0] as unknown as Conflito);
          await fetchMensagens(data[0].id);
        }
      } catch (error: any) {
        console.error('Erro ao carregar conflitos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os conflitos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConflitos();
  }, [toast]);

  // Buscar mensagens de um conflito específico
  const fetchMensagens = async (conflitoId: string) => {
    try {
      const { data, error } = await supabase
        .from('mensagens_conflitos')
        .select(`
          *,
          user:user_id (email)
        `)
        .eq('conflito_id', conflitoId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Conversão explícita para satisfazer o TypeScript
      setMensagens(data as unknown as Mensagem[]);
    } catch (error: any) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens deste conflito.",
        variant: "destructive"
      });
    }
  };

  // Selecionar conflito
  const handleSelecionarConflito = async (conflito: Conflito) => {
    setConflitoSelecionado(conflito);
    await fetchMensagens(conflito.id);
  };

  // Enviar nova mensagem
  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim() || !conflitoSelecionado) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para enviar mensagens.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('mensagens_conflitos')
        .insert({
          conflito_id: conflitoSelecionado.id,
          mensagem: novaMensagem,
          user_id: user.id,
          tipo_usuario: 'admin'
        });
        
      if (error) throw error;
      
      // Recarregar mensagens
      await fetchMensagens(conflitoSelecionado.id);
      setNovaMensagem('');
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive"
      });
    }
  };

  // Atualizar status do conflito
  const handleAtualizarStatus = async (novoStatus: string) => {
    if (!conflitoSelecionado) return;
    
    try {
      const { error } = await supabase
        .from('conflitos')
        .update({ 
          status: novoStatus,
          resolvido: novoStatus === 'resolvido',
          // Se o status for "estorno_aprovado", também aprovar o estorno
          estorno_aprovado: novoStatus === 'estorno_aprovado' ? true : conflitoSelecionado.estorno_aprovado
        })
        .eq('id', conflitoSelecionado.id);
        
      if (error) throw error;
      
      // Atualizar o conflito selecionado e a lista de conflitos
      const conflitosAtualizados = conflitos.map(c => {
        if (c.id === conflitoSelecionado.id) {
          return { 
            ...c, 
            status: novoStatus,
            resolvido: novoStatus === 'resolvido',
            estorno_aprovado: novoStatus === 'estorno_aprovado' ? true : c.estorno_aprovado
          };
        }
        return c;
      });
      
      setConflitos(conflitosAtualizados);
      setConflitoSelecionado({
        ...conflitoSelecionado,
        status: novoStatus,
        resolvido: novoStatus === 'resolvido',
        estorno_aprovado: novoStatus === 'estorno_aprovado' ? true : conflitoSelecionado.estorno_aprovado
      });
      
      toast({
        title: "Status atualizado",
        description: `O status do conflito foi atualizado para "${novoStatus}".`,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do conflito.",
        variant: "destructive"
      });
    }
  };

  // Status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'aberto':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-300">Aberto</Badge>;
      case 'em_analise':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300">Em análise</Badge>;
      case 'resolvido':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">Resolvido</Badge>;
      case 'estorno_solicitado':
        return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-300">Estorno solicitado</Badge>;
      case 'estorno_aprovado':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">Estorno aprovado</Badge>;
      case 'estorno_negado':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">Estorno negado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mediação de Conflitos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de conflitos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conflitos</CardTitle>
            <CardDescription>
              {conflitos.length} conflitos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="abertos">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="abertos" className="flex-1">Abertos</TabsTrigger>
                <TabsTrigger value="resolvidos" className="flex-1">Resolvidos</TabsTrigger>
                <TabsTrigger value="todos" className="flex-1">Todos</TabsTrigger>
              </TabsList>

              <TabsContent value="abertos">
                {conflitos
                  .filter(c => !c.resolvido)
                  .map(conflito => (
                    <div 
                      key={conflito.id}
                      className={`p-3 mb-2 rounded-lg cursor-pointer border ${conflito === conflitoSelecionado 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => handleSelecionarConflito(conflito)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{conflito.titulo}</h3>
                        {renderStatusBadge(conflito.status)}
                      </div>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">{conflito.descricao}</p>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>ID: {conflito.id.substring(0, 8)}</span>
                        <span>{new Date(conflito.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="resolvidos">
                {conflitos
                  .filter(c => c.resolvido)
                  .map(conflito => (
                    <div 
                      key={conflito.id}
                      className={`p-3 mb-2 rounded-lg cursor-pointer border ${conflito === conflitoSelecionado 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => handleSelecionarConflito(conflito)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{conflito.titulo}</h3>
                        {renderStatusBadge(conflito.status)}
                      </div>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">{conflito.descricao}</p>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>ID: {conflito.id.substring(0, 8)}</span>
                        <span>{new Date(conflito.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="todos">
                {conflitos.map(conflito => (
                  <div 
                    key={conflito.id}
                    className={`p-3 mb-2 rounded-lg cursor-pointer border ${conflito === conflitoSelecionado 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => handleSelecionarConflito(conflito)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{conflito.titulo}</h3>
                      {renderStatusBadge(conflito.status)}
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-1">{conflito.descricao}</p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>ID: {conflito.id.substring(0, 8)}</span>
                      <span>{new Date(conflito.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Detalhes do conflito */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {conflitoSelecionado ? (
                <div className="flex justify-between items-center">
                  <div>
                    {conflitoSelecionado.titulo}
                    <div className="mt-1">
                      {renderStatusBadge(conflitoSelecionado.status)}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => conflitoSelecionado && fetchMensagens(conflitoSelecionado.id)}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              ) : 'Selecione um conflito'}
            </CardTitle>
            {conflitoSelecionado && (
              <CardDescription>
                <div className="mt-2">
                  <p className="text-sm">{conflitoSelecionado.descricao}</p>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-sm">
                    <p><strong>Tutor:</strong> {conflitoSelecionado?.tutor?.nome_completo || 'N/A'}</p>
                    <p><strong>Email:</strong> {conflitoSelecionado?.tutor?.email || 'N/A'}</p>
                  </div>
                  <div className="text-sm">
                    <p><strong>Veterinário:</strong> {conflitoSelecionado?.veterinario?.nome_completo || 'N/A'}</p>
                    <p><strong>Email:</strong> {conflitoSelecionado?.veterinario?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <p><strong>Agendamento:</strong> ID {conflitoSelecionado?.agendamento?.id || 'N/A'}</p>
                  <p><strong>Serviço:</strong> {conflitoSelecionado?.agendamento?.servico?.nome || 'N/A'}</p>
                  <p><strong>Data:</strong> {conflitoSelecionado?.agendamento?.data_hora 
                    ? new Date(conflitoSelecionado.agendamento.data_hora).toLocaleString()
                    : 'N/A'}</p>
                </div>
                <div className="mt-4">
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      variant={conflitoSelecionado.status === 'em_analise' ? 'default' : 'outline'}
                      onClick={() => handleAtualizarStatus('em_analise')}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Em análise
                    </Button>
                    <Button 
                      size="sm" 
                      variant={conflitoSelecionado.status === 'resolvido' ? 'default' : 'outline'}
                      className={conflitoSelecionado.status === 'resolvido' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => handleAtualizarStatus('resolvido')}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Marcar resolvido
                    </Button>
                    
                    {conflitoSelecionado.estorno_solicitado && (
                      <>
                        <Button 
                          size="sm" 
                          variant={conflitoSelecionado.estorno_aprovado ? 'default' : 'outline'}
                          className={conflitoSelecionado.estorno_aprovado ? 'bg-green-600 hover:bg-green-700' : ''}
                          onClick={() => handleAtualizarStatus('estorno_aprovado')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar estorno
                        </Button>
                        <Button 
                          size="sm" 
                          variant={conflitoSelecionado.status === 'estorno_negado' ? 'default' : 'outline'}
                          className={conflitoSelecionado.status === 'estorno_negado' ? 'bg-red-600 hover:bg-red-700' : ''}
                          onClick={() => handleAtualizarStatus('estorno_negado')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Negar estorno
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {conflitoSelecionado ? (
              <>
                <div className="bg-gray-50 rounded-lg p-3 h-64 overflow-y-auto mb-4">
                  {mensagens.length > 0 ? (
                    mensagens.map((msg, index) => (
                      <div 
                        key={msg.id} 
                        className={`mb-3 flex ${msg.tipo_usuario === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`px-3 py-2 rounded-lg max-w-[80%] ${
                            msg.tipo_usuario === 'admin' 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <div className="text-xs mb-1 opacity-80">
                            {msg.user?.email || msg.tipo_usuario} - {new Date(msg.created_at).toLocaleTimeString()}
                          </div>
                          <p>{msg.mensagem}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="mx-auto h-8 w-8 opacity-50 mb-2" />
                        <p>Nenhuma mensagem neste conflito ainda.</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <textarea 
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite sua resposta..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={handleEnviarMensagem} disabled={!novaMensagem.trim()}>
                    <Mail className="h-4 w-4 mr-1" />
                    Enviar
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-10 w-10 opacity-50 mb-2" />
                  <p>Selecione um conflito para visualizar os detalhes.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MediacaoConflitosPage;
